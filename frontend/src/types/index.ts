export type UserRole = 'ADMIN' | 'USER';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface EnabledModule {
  code: string;
  name: string;
  description: string | null;
  enabledAt: string;
}
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK' | 'CHEQUE';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  tenantId: string;
  tenant?: Tenant;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  isActive: boolean;
  children?: Account[];
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  account?: { id: string; code: string; name: string };
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description?: string;
  reference?: string;
  lines?: JournalEntryLine[];
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paidAmount: number;
  lines?: InvoiceLine[];
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference?: string;
  journalEntryId?: string;
  invoice?: { id: string; invoiceNumber: string; customerName?: string; total?: number; paidAmount?: number; status?: string };
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterCompanyResponse {
  tenant: Tenant;
  user: User;
  token: string;
}
