import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { Prisma } from '@prisma/client';

interface JournalEntryLineInput {
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string;
}

@Injectable()
export class JournalEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateJournalEntryDto) {
    this.validateLines(dto.lines);

    const accountIds = dto.lines.map((l) => l.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds }, tenantId },
    });
    if (accounts.length !== accountIds.length) {
      const foundIds = new Set(accounts.map((a) => a.id));
      const invalid = accountIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Account(s) not found or do not belong to your organization: ${invalid.join(', ')}`,
      );
    }

    const entryNumber = await this.generateEntryNumber(tenantId, dto.date);

    const entry = await this.prisma.$transaction(async (tx) => {
      const created = await tx.journalEntry.create({
        data: {
          tenantId,
          entryNumber,
          date: new Date(dto.date),
          description: dto.description,
          reference: dto.reference,
        },
      });

      await tx.journalEntryLine.createMany({
        data: dto.lines.map((line) => ({
          entryId: created.id,
          accountId: line.accountId,
          debit: line.debit ?? 0,
          credit: line.credit ?? 0,
          description: line.description,
        })),
      });

      return created;
    });

    return this.findOne(tenantId, entry.id);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.JournalEntryWhereInput = { tenantId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lines: {
            include: {
              account: { select: { id: true, code: true, name: true } },
            },
          },
        },
      }),
      this.prisma.journalEntry.count({ where }),
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
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
          },
        },
      },
    });
    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }
    return entry;
  }

  validateBalance(lines: JournalEntryLineInput[]): void {
    const totalDebit = lines.reduce(
      (sum, l) => sum + (Number(l.debit) || 0),
      0,
    );
    const totalCredit = lines.reduce(
      (sum, l) => sum + (Number(l.credit) || 0),
      0,
    );
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Debits (${totalDebit}) must equal credits (${totalCredit})`,
      );
    }
  }

  validateLines(lines: JournalEntryLineInput[]): void {
    if (lines.length < 2) {
      throw new BadRequestException('Minimum 2 lines required for double-entry');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;

      if (debit < 0 || credit < 0) {
        throw new BadRequestException(`Line ${i + 1}: Amounts must be >= 0`);
      }
      if (debit === 0 && credit === 0) {
        throw new BadRequestException(`Line ${i + 1}: Either debit or credit must be > 0`);
      }
      if (debit > 0 && credit > 0) {
        throw new BadRequestException(`Line ${i + 1}: Cannot have both debit and credit > 0`);
      }
    }

    this.validateBalance(lines);
  }

  async generateEntryNumber(tenantId: string, dateStr: string): Promise<string> {
    const date = new Date(dateStr);
    const datePrefix = date.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `JE-${datePrefix}-`;

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: {
        tenantId,
        entryNumber: { startsWith: prefix },
      },
      orderBy: { entryNumber: 'desc' },
    });

    let seq = 1;
    if (lastEntry) {
      const parts = lastEntry.entryNumber.split('-');
      const lastSeq = parseInt(parts[2] || '0', 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(3, '0')}`;
  }

  async getAccountBalance(
    accountId: string,
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where: Prisma.JournalEntryLineWhereInput = {
      accountId,
      entry: {
        tenantId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
    };

    const lines = await this.prisma.journalEntryLine.findMany({
      where,
      select: { debit: true, credit: true },
    });

    const balance = lines.reduce((sum, line) => {
      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;
      return sum + debit - credit;
    }, 0);

    return Math.round(balance * 100) / 100;
  }
}
