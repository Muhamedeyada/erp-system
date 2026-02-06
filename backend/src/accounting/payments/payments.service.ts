import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod } from '@prisma/client';
import { InvoiceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

const CASH_ACCOUNT_CODE = '1101';
const BANK_ACCOUNT_CODE = '1102';
const AR_ACCOUNT_CODE = '1103';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private getCashAccountCode(method: PaymentMethod): string {
    return method === 'CASH' ? CASH_ACCOUNT_CODE : BANK_ACCOUNT_CODE;
  }

  private async createPaymentJournalEntry(
    payment: { id: string; amount: number; paymentDate: Date; invoice: { invoiceNumber: string }; tenantId: string },
    cashAccountId: string,
    arAccountId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const datePrefix = payment.paymentDate.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JE-${datePrefix}-`;
    const lastEntry = await tx.journalEntry.findFirst({
      where: { tenantId: payment.tenantId, entryNumber: { startsWith: prefix } },
      orderBy: { entryNumber: 'desc' },
    });
    let seq = 1;
    if (lastEntry) {
      const parts = lastEntry.entryNumber.split('-');
      seq = parseInt(parts[2] || '0', 10) + 1;
    }
    const entryNumber = `${prefix}${seq.toString().padStart(3, '0')}`;

    const desc = `Payment for Invoice #${payment.invoice.invoiceNumber}`;

    const journalEntry = await tx.journalEntry.create({
      data: {
        tenantId: payment.tenantId,
        entryNumber,
        date: payment.paymentDate,
        description: desc,
        reference: desc,
      },
    });

    await tx.journalEntryLine.createMany({
      data: [
        {
          entryId: journalEntry.id,
          accountId: cashAccountId,
          debit: payment.amount,
          credit: 0,
          description: desc,
        },
        {
          entryId: journalEntry.id,
          accountId: arAccountId,
          debit: 0,
          credit: payment.amount,
          description: desc,
        },
      ],
    });

    return journalEntry.id;
  }

  private async updateInvoiceStatus(
    invoiceId: string,
    newPaidAmount: number,
    invoiceTotal: number,
    tx: Prisma.TransactionClient,
  ): Promise<InvoiceStatus> {
    let status: InvoiceStatus;
    if (newPaidAmount >= invoiceTotal - 0.01) {
      status = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      status = InvoiceStatus.SENT;
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, status },
    });

    return status;
  }

  async create(tenantId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const total = Number(invoice.total);
    const paidAmount = Number(invoice.paidAmount);
    const outstanding = total - paidAmount;

    if (dto.amount > outstanding) {
      throw new BadRequestException(
        `Amount (${dto.amount}) exceeds outstanding balance (${outstanding})`,
      );
    }

    const cashAccountCode = this.getCashAccountCode(dto.method);
    const cashAccount = await this.prisma.account.findFirst({
      where: { tenantId, code: cashAccountCode },
    });
    const arAccount = await this.prisma.account.findFirst({
      where: { tenantId, code: AR_ACCOUNT_CODE },
    });
    if (!cashAccount || !arAccount) {
      throw new BadRequestException(
        `Chart of accounts incomplete. Ensure Cash (1101), Bank (1102), and Accounts Receivable (1103) exist.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          method: dto.method,
          reference: dto.reference,
        },
        include: { invoice: { select: { invoiceNumber: true } } },
      });

      const journalEntryId = await this.createPaymentJournalEntry(
        {
          id: payment.id,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          invoice: payment.invoice,
          tenantId,
        },
        cashAccount.id,
        arAccount.id,
        tx,
      );

      await tx.payment.update({
        where: { id: payment.id },
        data: { journalEntryId },
      });

      const newPaidAmount = paidAmount + dto.amount;
      await this.updateInvoiceStatus(
        dto.invoiceId,
        newPaidAmount,
        total,
        tx,
      );

      const created = await tx.payment.findFirst({
        where: { id: payment.id, tenantId },
        include: {
          invoice: true,
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
      if (!created) throw new NotFoundException('Payment not found');
      return created;
    });
  }

  async findAll(
    tenantId: string,
    invoiceId?: string,
    method?: PaymentMethod,
  ) {
    const where: Prisma.PaymentWhereInput = { tenantId };
    if (invoiceId) where.invoiceId = invoiceId;
    if (method) where.method = method;

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            paidAmount: true,
            status: true,
            customerName: true,
          },
        },
      },
    });

    return payments;
  }

  async findOne(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        invoice: true,
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
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
