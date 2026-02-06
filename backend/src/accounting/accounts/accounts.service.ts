import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { createDefaultChartOfAccounts } from './accounts.helper';
import { AccountType } from '@prisma/client';

export interface AccountTreeNode {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isActive: boolean;
  children: AccountTreeNode[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, type?: AccountType): Promise<AccountTreeNode[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        tenantId,
        ...(type && { type }),
      },
      orderBy: [{ code: 'asc' }],
    });

    return this.buildTree(accounts, null);
  }

  async findOne(tenantId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      include: {
        children: {
          where: { tenantId },
          orderBy: { code: 'asc' },
        },
        parent: {
          select: { id: true, code: true, name: true, type: true },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async create(tenantId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Account with code '${dto.code}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.account.findFirst({
        where: { id: dto.parentId, tenantId },
      });
      if (!parent) {
        throw new BadRequestException('Parent account not found or does not belong to your organization');
      }
      if (parent.type !== dto.type) {
        throw new BadRequestException('Child account type must match parent account type');
      }
    }

    return this.prisma.account.create({
      data: {
        tenantId,
        code: dto.code.trim(),
        name: dto.name.trim(),
        type: dto.type,
        parentId: dto.parentId || undefined,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      include: {
        children: true,
        journalEntryLines: { take: 1 },
      },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.children.length > 0) {
      throw new BadRequestException('Cannot delete account that has child accounts. Remove or reassign children first.');
    }

    if (account.journalEntryLines.length > 0) {
      throw new BadRequestException('Cannot delete account that has been used in journal entries. Deactivate it instead.');
    }

    return this.prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createDefaultChart(tenantId: string) {
    const existing = await this.prisma.account.findFirst({
      where: { tenantId },
    });
    if (existing) {
      throw new ConflictException(
        'Chart of accounts already exists. Delete existing accounts first to reseed.',
      );
    }
    return createDefaultChartOfAccounts(tenantId, this.prisma);
  }

  private buildTree(
    accounts: Array<{ id: string; code: string; name: string; type: AccountType; parentId: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }>,
    parentId: string | null,
  ): AccountTreeNode[] {
    return accounts
      .filter((a) => a.parentId === parentId)
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        parentId: a.parentId,
        isActive: a.isActive,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        children: this.buildTree(accounts, a.id),
      }));
  }
}
