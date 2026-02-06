export interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}
