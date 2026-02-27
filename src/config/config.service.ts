import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  get apiVersion(): string {
    return process.env.API_VERSION || '1.0.0';
  }

  get corsOrigins(): string[] {
    return (
      process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [
        'http://localhost:3001',
        'http://localhost:4200',
      ]
    );
  }

  // Auth
  get devAuthEnabled(): boolean {
    return process.env.DEV_AUTH_ENABLED === 'true';
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'dev-secret-change-me';
  }

  get oidcIssuerUrl(): string | undefined {
    return process.env.OIDC_ISSUER_URL;
  }

  get oidcAudience(): string | undefined {
    return process.env.OIDC_AUDIENCE;
  }

  // AI
  get aiProvider(): string {
    return process.env.AI_PROVIDER || 'mock';
  }

  get openaiApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }
}
