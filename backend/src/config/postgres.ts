import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

let pgPool: Pool | null = null;

if (connectionString) {
  pgPool = new Pool({ connectionString });
  console.log('Postgres pool configured');
} else {
  console.warn('DATABASE_URL not set. Postgres-backed features are disabled.');
}

export { pgPool };

export const isPostgresReady = (): boolean => pgPool !== null;
