import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../prisma/prisma.service';

const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private jwksClient: jwksRsa.JwksClient | null = null;

  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    if (this.config.oidcIssuerUrl) {
      this.jwksClient = jwksRsa({
        jwksUri: `${this.config.oidcIssuerUrl}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.verifyToken(token);
      // Ensure user exists in DB (upsert)
      const user = await this.prisma.user.upsert({
        where: { id: payload.sub },
        update: { email: payload.email, name: payload.name },
        create: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role || 'MEMBER',
        },
      });

      request.user = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return true;
    } catch (err) {
      this.logger.warn(`Authentication failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private async verifyToken(
    token: string,
  ): Promise<{ sub: string; email: string; name: string; role?: string }> {
    // Mode A: OIDC/JWKS
    if (this.jwksClient && this.config.oidcIssuerUrl) {
      return this.verifyOidcToken(token);
    }

    // Mode B: Dev Auth (local JWT)
    if (this.config.devAuthEnabled) {
      return this.verifyDevToken(token);
    }

    throw new Error('No authentication method configured');
  }

  private async verifyOidcToken(
    token: string,
  ): Promise<{ sub: string; email: string; name: string; role?: string }> {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }

    const key = await this.jwksClient!.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();

    const payload = jwt.verify(token, publicKey, {
      issuer: this.config.oidcIssuerUrl,
      audience: this.config.oidcAudience,
    }) as jwt.JwtPayload;

    return {
      sub: payload.sub!,
      email: payload.email as string,
      name: (payload.name as string) || payload.email as string,
      role: payload.role as string | undefined,
    };
  }

  private verifyDevToken(
    token: string,
  ): { sub: string; email: string; name: string; role?: string } {
    const payload = jwt.verify(token, this.config.jwtSecret) as jwt.JwtPayload;
    return {
      sub: payload.sub!,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  }
}
