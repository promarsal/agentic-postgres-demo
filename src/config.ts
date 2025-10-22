// Configuration
import 'dotenv/config';

export const config = {
  serviceId: process.env.TIGERDATA_SERVICE_ID || 'lr5jdh6ah6',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://tsdbadmin@lr5jdh6ah6.hles2ca4w9.tsdb.cloud.timescale.com:34416/tsdb?sslmode=require',
} as const;

if (!config.openaiApiKey) {
  console.error('❌ OPENAI_API_KEY not set in environment');
  console.error('   Add it to .env file');
  process.exit(1);
}

if (!config.databaseUrl) {
  console.error('❌ DATABASE_URL not set in environment');
  console.error('   Add your TigerData connection string to .env file');
  process.exit(1);
}

