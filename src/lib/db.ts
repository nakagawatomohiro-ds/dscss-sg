import { neon } from "@neondatabase/serverless";

// Cache the neon instance to avoid recreating on every query
let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

/**
 * Execute a parameterized query.
 * Uses sql.query() for conventional function call with value placeholders.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: unknown[]): Promise<any[]> {
  const sql = getDb();
  // Cast result to any[] since sql.query returns a union type
  return sql.query(text, params ?? []) as Promise<any[]>;
}
