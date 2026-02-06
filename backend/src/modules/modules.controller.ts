import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Public()
  @Get('modules')
  async listAll() {
    return this.modulesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tenant/modules')
  async listTenantModules(@CurrentUser() user: JwtPayload) {
    return this.modulesService.findEnabledForTenant(user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('tenant/modules/:code/enable')
  async enableModule(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.modulesService.enableModule(user.tenantId, code.toUpperCase());
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('tenant/modules/:code/disable')
  async disableModule(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.modulesService.disableModule(user.tenantId, code.toUpperCase());
  }
}
