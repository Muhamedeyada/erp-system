import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType } from '@prisma/client';

export interface TrialBalanceAccountRow {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  indentLevel: number;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceResult {
  startDate: string;
  endDate: string;
  accounts: TrialBalanceAccountRow[];
  totals: {
    debit: number;
    credit: number;
    balanced: boolean;
  };
}

interface AccountAggregation {
  accountId: string;
  debit: number;
  credit: number;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private groupEntriesByAccount(
    entries: Array<{ accountId: string; debit: unknown; credit: unknown }>,
  ): Map<string, AccountAggregation> {
    const map = new Map<string, AccountAggregation>();
    for (const entry of entries) {
      const debit = Number(entry.debit);
      const credit = Number(entry.credit);

      const existing = map.get(entry.accountId);
      if (existing) {
        existing.debit += debit;
        existing.credit += credit;
      } else {
        map.set(entry.accountId, { accountId: entry.accountId, debit, credit });
      }
    }
    return map;
  }

  private calculateAccountBalance(
    accountType: AccountType,
    debit: number,
    credit: number,
  ): number {
    if (
      accountType === 'ASSET' ||
      accountType === 'EXPENSE'
    ) {
      return Math.round((debit - credit) * 100) / 100;
    }
    return Math.round((credit - debit) * 100) / 100;
  }

  private getIndentLevel(account: { parentId: string | null }, accountMap: Map<string, { parentId: string | null }>): number {
    let level = 0;
    let currentId: string | null = account.parentId;
    while (currentId) {
      level++;
      const parent = accountMap.get(currentId);
      currentId = parent?.parentId ?? null;
    }
    return level;
  }

  async getTrialBalance(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TrialBalanceResult> {
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        entry: {
          tenantId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
      },
      select: {
        accountId: true,
        debit: true,
        credit: true,
      },
    });

    const aggregated = this.groupEntriesByAccount(lines);

    if (aggregated.size === 0) {
      return {
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        accounts: [],
        totals: { debit: 0, credit: 0, balanced: true },
      };
    }

    const accountIds = Array.from(aggregated.keys());
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds }, tenantId },
      select: { id: true, code: true, name: true, type: true, parentId: true },
    });

    const accountMap = new Map(accounts.map((a) => [a.id, { parentId: a.parentId }]));

    const rows: TrialBalanceAccountRow[] = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const account of accounts.sort((a, b) => a.code.localeCompare(b.code))) {
      const agg = aggregated.get(account.id);
      if (!agg) continue;

      const debit = Math.round(agg.debit * 100) / 100;
      const credit = Math.round(agg.credit * 100) / 100;
      const balance = this.calculateAccountBalance(account.type, debit, credit);
      const indentLevel = this.getIndentLevel(account, accountMap);

      totalDebit += debit;
      totalCredit += credit;

      rows.push({
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        indentLevel,
        debit,
        credit,
        balance,
      });
    }

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;
    const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return {
      startDate: startDate ?? '',
      endDate: endDate ?? '',
      accounts: rows,
      totals: {
        debit: totalDebit,
        credit: totalCredit,
        balanced,
      },
    };
  }
}
