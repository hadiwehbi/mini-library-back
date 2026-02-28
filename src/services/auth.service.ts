import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors';
import { DevLoginInput } from '../schemas/auth.schema';

export async function devLogin(
  dto: DevLoginInput,
): Promise<{ accessToken: string; expiresIn: number }> {
  if (!config.devAuthEnabled) {
    throw new ForbiddenError('Dev auth is not enabled');
  }

  const user = await prisma.user.upsert({
    where: { id: dto.sub },
    update: { email: dto.email, name: dto.name, role: dto.role },
    create: {
      id: dto.sub,
      email: dto.email,
      name: dto.name,
      role: dto.role,
    },
  });

  const expiresIn = 86400; // 24 hours
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn },
  );

  return { accessToken, expiresIn };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
