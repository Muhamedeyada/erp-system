import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleGuard } from '../../common/guards/module.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentUser, JwtPayload } from '../../auth/decorators/current-user.decorator';
import { PaymentMethod } from '@prisma/client';

@Controller('accounting/payments')
@UseGuards(JwtAuthGuard, ModuleGuard)
@RequireModule('ACCOUNTING')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('invoiceId') invoiceId?: string,
    @Query('method') method?: PaymentMethod,
  ) {
    return this.paymentsService.findAll(user.tenantId, invoiceId, method);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.findOne(user.tenantId, id);
  }
}
