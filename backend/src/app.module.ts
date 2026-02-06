import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { RootController } from './root.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ModulesModule } from './modules/modules.module';
import { AccountsModule } from './accounting/accounts/accounts.module';
import { JournalEntriesModule } from './accounting/journal-entries/journal-entries.module';
import { InvoicesModule } from './accounting/invoices/invoices.module';
import { PaymentsModule } from './accounting/payments/payments.module';
import { ReportsModule } from './accounting/reports/reports.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule, CommonModule, ModulesModule, AccountsModule, JournalEntriesModule, InvoicesModule, PaymentsModule, ReportsModule],
  controllers: [AppController, RootController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
