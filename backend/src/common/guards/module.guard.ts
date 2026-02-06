import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredModule) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const tenantModule = await this.prisma.tenantModule.findUnique({
      where: {
        tenantId_moduleCode: {
          tenantId: user.tenantId,
          moduleCode: requiredModule,
        },
      },
    });

    if (!tenantModule?.isEnabled) {
      throw new ForbiddenException(
        `Module '${requiredModule}' is not enabled for your organization`,
      );
    }

    return true;
  }
}
