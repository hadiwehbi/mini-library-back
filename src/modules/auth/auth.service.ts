import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DevLoginDto } from './dto/dev-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async devLogin(dto: DevLoginDto): Promise<{ accessToken: string; expiresIn: number }> {
    if (!this.config.devAuthEnabled) {
      throw new ForbiddenException('Dev auth is not enabled');
    }

    // Upsert user
    const user = await this.prisma.user.upsert({
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
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      this.config.jwtSecret,
      { expiresIn },
    );

    return { accessToken: token, expiresIn };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
