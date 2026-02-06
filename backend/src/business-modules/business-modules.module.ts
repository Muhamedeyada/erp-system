import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounting/accounts/accounts.module';
import { JournalEntriesModule } from '../accounting/journal-entries/journal-entries.module';
import { InvoicesModule } from '../accounting/invoices/invoices.module';
import { PaymentsModule } from '../accounting/payments/payments.module';
import { ReportsModule } from '../accounting/reports/reports.module';

@Module({
  imports: [
    AccountsModule,
    JournalEntriesModule,
    InvoicesModule,
    PaymentsModule,
    ReportsModule,
  ],
})
export class BusinessModulesModule {}
