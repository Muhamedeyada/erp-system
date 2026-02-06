import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

const AR_ACCOUNT_CODE = '1103';
const REVENUE_ACCOUNT_CODE = '4001';

interface LineInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface TotalsResult {
  subtotal: number;
  tax: number;
  total: number;
}

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  calculateTotals(lines: LineInput[]): TotalsResult {
    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );
    const tax = 0;
    const total = subtotal + tax;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  async generateInvoiceNumber(tenantId: string): Promise<string> {
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV-${datePrefix}-`;

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let seq = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[2] || '0', 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(3, '0')}`;
  }

  private async createInvoiceJournalEntry(
    invoice: { id: string; invoiceNumber: string; total: { toNumber: () => number } | number; date: Date; tenantId: string },
    arAccountId: string,
    revenueAccountId: string,
    tx: Prisma.TransactionClient,
  ) {
    const total = typeof invoice.total === 'number' ? invoice.total : invoice.total.toNumber();
    if (total <= 0) return null;

    const datePrefix = invoice.date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JE-${datePrefix}-`;
    const lastEntry = await tx.journalEntry.findFirst({
      where: { tenantId: invoice.tenantId, entryNumber: { startsWith: prefix } },
      orderBy: { entryNumber: 'desc' },
    });
    let seq = 1;
    if (lastEntry) {
      const parts = lastEntry.entryNumber.split('-');
      seq = parseInt(parts[2] || '0', 10) + 1;
    }
    const entryNumber = `${prefix}${seq.toString().padStart(3, '0')}`;

    const journalEntry = await tx.journalEntry.create({
      data: {
        tenantId: invoice.tenantId,
        entryNumber,
        date: invoice.date,
        description: `Invoice #${invoice.invoiceNumber}`,
        reference: `Invoice #${invoice.invoiceNumber}`,
      },
    });

    await tx.journalEntryLine.createMany({
      data: [
        {
          entryId: journalEntry.id,
          accountId: arAccountId,
          debit: total,
          credit: 0,
          description: `Invoice #${invoice.invoiceNumber}`,
        },
        {
          entryId: journalEntry.id,
          accountId: revenueAccountId,
          debit: 0,
          credit: total,
          description: `Invoice #${invoice.invoiceNumber}`,
        },
      ],
    });

    return journalEntry.id;
  }

  async create(tenantId: string, dto: CreateInvoiceDto) {
    const totals = this.calculateTotals(dto.lines);
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    const arAccount = await this.prisma.account.findFirst({
      where: { tenantId, code: AR_ACCOUNT_CODE },
    });
    const revenueAccount = await this.prisma.account.findFirst({
      where: { tenantId, code: REVENUE_ACCOUNT_CODE },
    });
    if (!arAccount || !revenueAccount) {
      throw new BadRequestException(
        'Chart of accounts incomplete. Ensure Accounts Receivable (1103) and Sales Revenue (4001) exist.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerName: dto.customerName,
          customerId: dto.customerId,
          date: new Date(dto.date),
          dueDate: new Date(dto.dueDate),
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          status: InvoiceStatus.SENT,
          paidAmount: 0,
        },
      });

      await tx.invoiceLine.createMany({
        data: dto.lines.map((line) => ({
          invoiceId: invoice.id,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          total: line.quantity * line.unitPrice,
        })),
      });

      const journalEntryId = await this.createInvoiceJournalEntry(
        { ...invoice, total: totals.total, date: new Date(dto.date) },
        arAccount.id,
        revenueAccount.id,
        tx,
      );

      if (journalEntryId) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { journalEntryId },
        });
      }

      const created = await tx.invoice.findFirst({
        where: { id: invoice.id, tenantId },
        include: {
          lines: true,
          payments: true,
          journalEntry: {
            include: {
              lines: {
                include: {
                  account: { select: { id: true, code: true, name: true } },
                },
              },
            },
          },
        },
      });
      if (!created) throw new NotFoundException('Invoice not found');
      return created;
    });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    status?: InvoiceStatus,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.InvoiceWhereInput = { tenantId };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { lines: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        lines: true,
        payments: true,
        journalEntry: {
          include: {
            lines: {
              include: {
                account: { select: { id: true, code: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async updateStatus(tenantId: string, id: string, status: InvoiceStatus) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (status === InvoiceStatus.CANCELLED && Number(invoice.paidAmount) > 0) {
      throw new BadRequestException(
        'Cannot cancel invoice that has received payments',
      );
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }
}
