import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../decorators/jwt-payload.interface';

// Extend Express Request to include tenantId and jwtPayload
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      jwtPayload?: JwtPayload;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = this.jwtService.verify<JwtPayload>(token);
        req.tenantId = payload.tenantId;
        req.jwtPayload = payload;
      } catch {
        // Invalid/expired token - leave tenantId/user undefined
        // JwtAuthGuard will reject on protected routes
      }
    }
    next();
  }
}
