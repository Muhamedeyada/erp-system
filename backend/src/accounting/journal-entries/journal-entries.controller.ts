import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleGuard } from '../../common/guards/module.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';
import { CurrentUser, JwtPayload } from '../../auth/decorators/current-user.decorator';

@Controller('accounting/journal-entries')
@UseGuards(JwtAuthGuard, ModuleGuard)
@RequireModule('ACCOUNTING')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJournalEntryDto) {
    return this.journalEntriesService.create(user.tenantId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.journalEntriesService.findAll(
      user.tenantId,
      pageNum,
      limitNum,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.journalEntriesService.findOne(user.tenantId, id);
  }
}
