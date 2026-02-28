export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || '1.0.0',

  corsOrigins: (
    process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:4200'
  )
    .split(',')
    .map((o) => o.trim()),

  // Auth
  devAuthEnabled: process.env.DEV_AUTH_ENABLED === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  oidcIssuerUrl: process.env.OIDC_ISSUER_URL,
  oidcAudience: process.env.OIDC_AUDIENCE,

  // AI
  aiProvider: process.env.AI_PROVIDER || 'mock',
  openaiApiKey: process.env.OPENAI_API_KEY,
};
