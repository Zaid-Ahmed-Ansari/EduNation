import { Pool } from "pg";

let pgPool: Pool | null = null;

export const localPostgresInit = () => {
  // Initialize local Postgres client
  const connectionString = process.env.DATABASE_URL || "";

  if (connectionString) {
    pgPool = new Pool({ connectionString });
    console.log("Postgres pool configured");
  } else {
    console.warn(
      "DATABASE_URL not set. Postgres-backed features are disabled.",
    );
  }
};

export const getPgPool = () => {
  if (!pgPool) throw new Error("Postgres not initialized");
  return pgPool;
};
export const isPostgresReady = (): boolean => pgPool !== null;
