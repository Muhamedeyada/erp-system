import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCompanyDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

const CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Assets', type: 'ASSET' as const, parentCode: null },
  { code: '1100', name: 'Current Assets', type: 'ASSET' as const, parentCode: '1000' },
  { code: '1101', name: 'Cash', type: 'ASSET' as const, parentCode: '1100' },
  { code: '1102', name: 'Bank Account', type: 'ASSET' as const, parentCode: '1100' },
  { code: '1103', name: 'Accounts Receivable', type: 'ASSET' as const, parentCode: '1100' },
  { code: '1200', name: 'Fixed Assets', type: 'ASSET' as const, parentCode: '1000' },
  { code: '1201', name: 'Equipment', type: 'ASSET' as const, parentCode: '1200' },
  { code: '1202', name: 'Vehicles', type: 'ASSET' as const, parentCode: '1200' },
  { code: '2000', name: 'Liabilities', type: 'LIABILITY' as const, parentCode: null },
  { code: '2100', name: 'Current Liabilities', type: 'LIABILITY' as const, parentCode: '2000' },
  { code: '2101', name: 'Accounts Payable', type: 'LIABILITY' as const, parentCode: '2100' },
  { code: '2102', name: 'Taxes Payable', type: 'LIABILITY' as const, parentCode: '2100' },
  { code: '3000', name: 'Equity', type: 'EQUITY' as const, parentCode: null },
  { code: '3001', name: "Owner's Equity", type: 'EQUITY' as const, parentCode: '3000' },
  { code: '4000', name: 'Revenue', type: 'REVENUE' as const, parentCode: null },
  { code: '4001', name: 'Sales Revenue', type: 'REVENUE' as const, parentCode: '4000' },
  { code: '5000', name: 'Expenses', type: 'EXPENSE' as const, parentCode: null },
  { code: '5001', name: 'Cost of Goods Sold', type: 'EXPENSE' as const, parentCode: '5000' },
  { code: '5002', name: 'Salaries Expense', type: 'EXPENSE' as const, parentCode: '5000' },
  { code: '5003', name: 'Rent Expense', type: 'EXPENSE' as const, parentCode: '5000' },
  { code: '5004', name: 'Utilities Expense', type: 'EXPENSE' as const, parentCode: '5000' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    const slug = slugify(dto.companyName);
    if (!slug) {
      throw new ConflictException('Invalid company name');
    }

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (existingTenant) {
      throw new ConflictException(
        `Company with slug "${slug}" already exists. Try a different company name.`,
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          slug,
        },
      });

      await (tx as any)['module'].upsert({
        where: { code: 'ACCOUNTING' },
        update: {},
        create: {
          code: 'ACCOUNTING',
          name: 'Accounting',
          description: 'General ledger, journal entries, invoicing, and payments',
          isActive: true,
        },
      });

      await tx.tenantModule.create({
        data: {
          tenantId: tenant.id,
          moduleCode: 'ACCOUNTING',
          isEnabled: true,
          enabledAt: new Date(),
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          password: hashedPassword,
          name: dto.name || dto.companyName,
          role: UserRole.ADMIN,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
      });

      const accountIdByCode: Record<string, string> = {};
      for (const acc of CHART_OF_ACCOUNTS) {
        const created = await tx.account.create({
          data: {
            tenantId: tenant.id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            parentId: acc.parentCode
              ? accountIdByCode[acc.parentCode]
              : undefined,
          },
        });
        accountIdByCode[acc.code] = created.id;
      }

      return { tenant, user };
    });

    const payload: JwtPayload = {
      userId: result.user.id,
      email: result.user.email,
      tenantId: result.user.tenantId,
      role: result.user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      tenant: result.tenant,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        tenantId: result.user.tenantId,
        tenant: result.user.tenant,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    let user;
    if (dto.tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug: dto.tenantSlug },
      });
      if (!tenant) {
        throw new UnauthorizedException('Invalid credentials');
      }
      user = await this.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: dto.email,
          },
        },
        include: { tenant: { select: { id: true, name: true, slug: true } } },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: { email: dto.email },
        include: { tenant: { select: { id: true, name: true, slug: true } } },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
