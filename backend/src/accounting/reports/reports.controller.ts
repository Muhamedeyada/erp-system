import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { TrialBalanceQueryDto } from './dto/trial-balance-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleGuard } from '../../common/guards/module.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentUser, JwtPayload } from '../../auth/decorators/current-user.decorator';

@Controller('accounting/reports')
@UseGuards(JwtAuthGuard, ModuleGuard)
@RequireModule('ACCOUNTING')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  async getTrialBalance(
    @CurrentUser() user: JwtPayload,
    @Query() query: TrialBalanceQueryDto,
  ) {
    return this.reportsService.getTrialBalance(
      user.tenantId,
      query.startDate,
      query.endDate,
    );
  }
}
