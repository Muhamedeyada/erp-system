import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | string | number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data && user ? user[data] : user;
  },
);
