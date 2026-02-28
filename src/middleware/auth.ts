import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { config } from '../config';
import { prisma } from '../prisma';
import { UnauthorizedError } from '../errors';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

let jwksClient: jwksRsa.JwksClient | null = null;

if (config.oidcIssuerUrl) {
  jwksClient = jwksRsa({
    jwksUri: `${config.oidcIssuerUrl}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  });
}

async function verifyOidcToken(
  token: string,
): Promise<{ sub: string; email: string; name: string; role?: string }> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }

  const key = await jwksClient!.getSigningKey(decoded.header.kid);
  const publicKey = key.getPublicKey();

  const payload = jwt.verify(token, publicKey, {
    issuer: config.oidcIssuerUrl,
    audience: config.oidcAudience,
  }) as jwt.JwtPayload;

  return {
    sub: payload.sub!,
    email: payload.email as string,
    name: (payload.name as string) || (payload.email as string),
    role: payload.role as string | undefined,
  };
}

function verifyDevToken(
  token: string,
): { sub: string; email: string; name: string; role?: string } {
  const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
  return {
    sub: payload.sub!,
    email: payload.email as string,
    name: payload.name as string,
    role: payload.role as string,
  };
}

async function verifyToken(
  token: string,
): Promise<{ sub: string; email: string; name: string; role?: string }> {
  if (jwksClient && config.oidcIssuerUrl) {
    return verifyOidcToken(token);
  }
  if (config.devAuthEnabled) {
    return verifyDevToken(token);
  }
  throw new Error('No authentication method configured');
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const auth = req.headers.authorization;
  if (!auth) {
    next(new UnauthorizedError('Missing authentication token'));
    return;
  }

  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new UnauthorizedError('Invalid authorization header format'));
    return;
  }

  verifyToken(token)
    .then(async (payload) => {
      const user = await prisma.user.upsert({
        where: { id: payload.sub },
        update: { email: payload.email, name: payload.name },
        create: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role || 'MEMBER',
        },
      });

      req.user = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      next();
    })
    .catch(() => {
      next(new UnauthorizedError('Invalid or expired token'));
    });
}
