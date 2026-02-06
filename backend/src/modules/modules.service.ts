import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const modules = await this.prisma.module.findMany({
      where: { isActive: true },
      select: {
        code: true,
        name: true,
        description: true,
      },
    });
    return modules;
  }

  async findEnabledForTenant(tenantId: string) {
    const tenantModules = await this.prisma.tenantModule.findMany({
      where: {
        tenantId,
        isEnabled: true,
      },
      include: {
        module: {
          select: { code: true, name: true, description: true },
        },
      },
    });
    return tenantModules.map((tm) => ({
      ...tm.module,
      enabledAt: tm.enabledAt,
    }));
  }

  async enableModule(tenantId: string, moduleCode: string) {
    const module = await this.prisma.module.findUnique({
      where: { code: moduleCode },
    });
    if (!module) {
      throw new NotFoundException(`Module '${moduleCode}' not found`);
    }
    if (!module.isActive) {
      throw new ConflictException(`Module '${moduleCode}' is not available`);
    }

    await this.prisma.tenantModule.upsert({
      where: {
        tenantId_moduleCode: { tenantId, moduleCode },
      },
      update: { isEnabled: true, enabledAt: new Date() },
      create: {
        tenantId,
        moduleCode,
        isEnabled: true,
        enabledAt: new Date(),
      },
    });

    return this.prisma.module.findUnique({
      where: { code: moduleCode },
      select: { code: true, name: true, description: true },
    });
  }

  async disableModule(tenantId: string, moduleCode: string) {
    const tenantModule = await this.prisma.tenantModule.findUnique({
      where: {
        tenantId_moduleCode: { tenantId, moduleCode },
      },
    });
    if (!tenantModule) {
      throw new NotFoundException(
        `Module '${moduleCode}' is not enabled for your organization`,
      );
    }

    await this.prisma.tenantModule.update({
      where: {
        tenantId_moduleCode: { tenantId, moduleCode },
      },
      data: { isEnabled: false, enabledAt: null },
    });

    return { code: moduleCode, enabled: false };
  }
}
