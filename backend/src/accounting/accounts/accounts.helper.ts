import { PrismaService } from '../../prisma/prisma.service';
import { AccountType } from '@prisma/client';

interface ChartAccountDef {
  code: string;
  name: string;
  type: AccountType;
  parentCode: string | null;
}

const DEFAULT_CHART_OF_ACCOUNTS: ChartAccountDef[] = [
  { code: '1000', name: 'Assets', type: 'ASSET', parentCode: null },
  { code: '1100', name: 'Current Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1101', name: 'Cash', type: 'ASSET', parentCode: '1100' },
  { code: '1102', name: 'Bank Account', type: 'ASSET', parentCode: '1100' },
  { code: '1103', name: 'Accounts Receivable', type: 'ASSET', parentCode: '1100' },
  { code: '1200', name: 'Fixed Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1201', name: 'Equipment', type: 'ASSET', parentCode: '1200' },
  { code: '1202', name: 'Vehicles', type: 'ASSET', parentCode: '1200' },
  { code: '2000', name: 'Liabilities', type: 'LIABILITY', parentCode: null },
  { code: '2100', name: 'Current Liabilities', type: 'LIABILITY', parentCode: '2000' },
  { code: '2101', name: 'Accounts Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '2102', name: 'Taxes Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '3000', name: 'Equity', type: 'EQUITY', parentCode: null },
  { code: '3001', name: "Owner's Equity", type: 'EQUITY', parentCode: '3000' },
  { code: '4000', name: 'Revenue', type: 'REVENUE', parentCode: null },
  { code: '4001', name: 'Sales Revenue', type: 'REVENUE', parentCode: '4000' },
  { code: '5000', name: 'Expenses', type: 'EXPENSE', parentCode: null },
  { code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE', parentCode: '5000' },
  { code: '5002', name: 'Salaries Expense', type: 'EXPENSE', parentCode: '5000' },
  { code: '5003', name: 'Rent Expense', type: 'EXPENSE', parentCode: '5000' },
  { code: '5004', name: 'Utilities Expense', type: 'EXPENSE', parentCode: '5000' },
];

export async function createDefaultChartOfAccounts(
  tenantId: string,
  prisma: PrismaService,
) {
  const accountIdByCode: Record<string, string> = {};
  const created: Array<{ id: string; code: string; name: string; type: string }> = [];

  for (const acc of DEFAULT_CHART_OF_ACCOUNTS) {
    const account = await prisma.account.create({
      data: {
        tenantId,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        parentId: acc.parentCode ? accountIdByCode[acc.parentCode] : undefined,
      },
    });
    accountIdByCode[acc.code] = account.id;
    created.push({
      id: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
    });
  }

  return created;
}
