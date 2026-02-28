import { createApp } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './prisma';

async function main() {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`Application running on port ${config.port}`);
    console.log(`Swagger docs available at http://localhost:${config.port}/api/docs`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
