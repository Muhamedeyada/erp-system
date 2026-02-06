import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleGuard } from '../../common/guards/module.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentUser, JwtPayload } from '../../auth/decorators/current-user.decorator';
import { AccountType } from '@prisma/client';

@Controller('accounting/accounts')
@UseGuards(JwtAuthGuard, ModuleGuard)
@RequireModule('ACCOUNTING')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('seed-default')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async seedDefaultChart(@CurrentUser() user: JwtPayload) {
    return this.accountsService.createDefaultChart(user.tenantId);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: AccountType,
  ) {
    return this.accountsService.findAll(user.tenantId, type);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accountsService.findOne(user.tenantId, id);
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accountsService.remove(user.tenantId, id);
  }
}
