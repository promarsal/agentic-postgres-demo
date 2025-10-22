// Configuration for web app
import 'dotenv/config';

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
} as const;

if (!config.openaiApiKey) {
  console.warn('⚠️  OPENAI_API_KEY not set');
}

if (!config.databaseUrl) {
  console.warn('⚠️  DATABASE_URL not set');
}

