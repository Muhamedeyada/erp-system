import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.$transaction(async (_tx) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tx = _tx as any;

    await tx['module'].upsert({
      where: { code: 'ACCOUNTING' },
      update: {},
      create: {
        code: 'ACCOUNTING',
        name: 'Accounting',
        description: 'General ledger, journal entries, invoicing, and payments',
        isActive: true,
      },
    });
    console.log('  ✓ ACCOUNTING module ready');

    const tenant = await tx.tenant.upsert({
      where: { slug: 'demo' },
      update: { name: 'Demo Company' },
      create: {
        name: 'Demo Company',
        slug: 'demo',
      },
    });
    console.log('  ✓ Demo tenant created');

    await tx.tenantModule.upsert({
      where: {
        tenantId_moduleCode: {
          tenantId: tenant.id,
          moduleCode: 'ACCOUNTING',
        },
      },
      update: { isEnabled: true, enabledAt: new Date() },
      create: {
        tenantId: tenant.id,
        moduleCode: 'ACCOUNTING',
        isEnabled: true,
        enabledAt: new Date(),
      },
    });
    console.log('  ✓ ACCOUNTING module enabled');

    const hashedPassword = await bcrypt.hash('demo123', 10);
    await tx.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: 'demo@demo.com',
        },
      },
      update: { password: hashedPassword, name: 'Demo Admin', role: 'ADMIN' },
      create: {
        tenantId: tenant.id,
        email: 'demo@demo.com',
        password: hashedPassword,
        name: 'Demo Admin',
        role: 'ADMIN',
      },
    });
    console.log('  ✓ Admin user created (demo@demo.com / demo123)');

    await tx.payment.deleteMany({ where: { tenantId: tenant.id } });
    await tx.invoiceLine.deleteMany({
      where: { invoice: { tenantId: tenant.id } },
    });
    await tx.invoice.deleteMany({ where: { tenantId: tenant.id } });
    await tx.journalEntryLine.deleteMany({
      where: { entry: { tenantId: tenant.id } },
    });
    await tx.journalEntry.deleteMany({ where: { tenantId: tenant.id } });
    await tx.account.deleteMany({ where: { tenantId: tenant.id } });

    const acc1000 = await tx.account.create({
      data: { tenantId: tenant.id, code: '1000', name: 'Assets', type: 'ASSET' },
    });
    const acc1100 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1100',
        name: 'Current Assets',
        type: 'ASSET',
        parentId: acc1000.id,
      },
    });
    const acc1101 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1101',
        name: 'Cash',
        type: 'ASSET',
        parentId: acc1100.id,
      },
    });
    const acc1102 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1102',
        name: 'Bank Account',
        type: 'ASSET',
        parentId: acc1100.id,
      },
    });
    const acc1103 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1103',
        name: 'Accounts Receivable',
        type: 'ASSET',
        parentId: acc1100.id,
      },
    });
    const acc1200 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1200',
        name: 'Fixed Assets',
        type: 'ASSET',
        parentId: acc1000.id,
      },
    });
    const acc1201 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1201',
        name: 'Equipment',
        type: 'ASSET',
        parentId: acc1200.id,
      },
    });
    const acc1202 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '1202',
        name: 'Vehicles',
        type: 'ASSET',
        parentId: acc1200.id,
      },
    });

    const acc2000 = await tx.account.create({
      data: { tenantId: tenant.id, code: '2000', name: 'Liabilities', type: 'LIABILITY' },
    });
    const acc2100 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '2100',
        name: 'Current Liabilities',
        type: 'LIABILITY',
        parentId: acc2000.id,
      },
    });
    const acc2101 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '2101',
        name: 'Accounts Payable',
        type: 'LIABILITY',
        parentId: acc2100.id,
      },
    });
    const acc2102 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '2102',
        name: 'Taxes Payable',
        type: 'LIABILITY',
        parentId: acc2100.id,
      },
    });

    const acc3000 = await tx.account.create({
      data: { tenantId: tenant.id, code: '3000', name: 'Equity', type: 'EQUITY' },
    });
    const acc3001 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '3001',
        name: "Owner's Equity",
        type: 'EQUITY',
        parentId: acc3000.id,
      },
    });

    const acc4000 = await tx.account.create({
      data: { tenantId: tenant.id, code: '4000', name: 'Revenue', type: 'REVENUE' },
    });
    const acc4001 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '4001',
        name: 'Sales Revenue',
        type: 'REVENUE',
        parentId: acc4000.id,
      },
    });

    const acc5000 = await tx.account.create({
      data: { tenantId: tenant.id, code: '5000', name: 'Expenses', type: 'EXPENSE' },
    });
    const acc5001 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '5001',
        name: 'Cost of Goods Sold',
        type: 'EXPENSE',
        parentId: acc5000.id,
      },
    });
    const acc5002 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '5002',
        name: 'Salaries Expense',
        type: 'EXPENSE',
        parentId: acc5000.id,
      },
    });
    const acc5003 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '5003',
        name: 'Rent Expense',
        type: 'EXPENSE',
        parentId: acc5000.id,
      },
    });
    const acc5004 = await tx.account.create({
      data: {
        tenantId: tenant.id,
        code: '5004',
        name: 'Utilities Expense',
        type: 'EXPENSE',
        parentId: acc5000.id,
      },
    });
    console.log('  ✓ Chart of accounts created');

    const je1 = await tx.journalEntry.create({
      data: {
        tenantId: tenant.id,
        entryNumber: 'JE-001',
        date: new Date('2024-01-01'),
        description: 'Initial capital contribution',
      },
    });
    await tx.journalEntryLine.createMany({
      data: [
        { entryId: je1.id, accountId: acc1101.id, debit: 10000, credit: 0, description: 'Cash received' },
        { entryId: je1.id, accountId: acc3001.id, debit: 0, credit: 10000, description: 'Owner investment' },
      ],
    });

    const je2 = await tx.journalEntry.create({
      data: {
        tenantId: tenant.id,
        entryNumber: 'JE-002',
        date: new Date('2024-01-15'),
        description: 'Equipment purchase',
      },
    });
    await tx.journalEntryLine.createMany({
      data: [
        { entryId: je2.id, accountId: acc1201.id, debit: 5000, credit: 0, description: 'Office equipment' },
        { entryId: je2.id, accountId: acc1101.id, debit: 0, credit: 5000, description: 'Cash payment' },
      ],
    });

    const je3 = await tx.journalEntry.create({
      data: {
        tenantId: tenant.id,
        entryNumber: 'JE-003',
        date: new Date('2024-02-01'),
        description: 'Office supplies expense',
      },
    });
    await tx.journalEntryLine.createMany({
      data: [
        { entryId: je3.id, accountId: acc5004.id, debit: 150, credit: 0, description: 'Utilities' },
        { entryId: je3.id, accountId: acc1101.id, debit: 0, credit: 150, description: 'Cash payment' },
      ],
    });
    console.log('  ✓ 3 journal entries created');

    const inv1 = await tx.invoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber: 'INV-001',
        customerName: 'Acme Corp',
        date: new Date('2024-02-10'),
        dueDate: new Date('2024-03-10'),
        subtotal: 900,
        tax: 100,
        total: 1000,
        status: 'PAID',
        paidAmount: 1000,
      },
    });
    await tx.invoiceLine.createMany({
      data: [
        { invoiceId: inv1.id, description: 'Consulting services', quantity: 10, unitPrice: 90, total: 900 },
      ],
    });

    const inv2 = await tx.invoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber: 'INV-002',
        customerName: 'Beta LLC',
        date: new Date('2024-02-15'),
        dueDate: new Date('2024-03-15'),
        subtotal: 450,
        tax: 50,
        total: 500,
        status: 'PARTIALLY_PAID',
        paidAmount: 250,
      },
    });
    await tx.invoiceLine.createMany({
      data: [
        { invoiceId: inv2.id, description: 'Software license', quantity: 1, unitPrice: 450, total: 450 },
      ],
    });
    console.log('  ✓ 2 invoices created (PAID, PARTIALLY_PAID)');

    await tx.payment.create({
      data: {
        tenantId: tenant.id,
        invoiceId: inv2.id,
        amount: 250,
        paymentDate: new Date('2024-02-20'),
        method: 'BANK',
        reference: 'CHQ-1001',
      },
    });
    console.log('  ✓ 1 payment created');
  });

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
