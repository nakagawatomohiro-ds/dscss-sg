import { neon } from "@neondatabase/serverless";

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/**
 * Execute a parameterized query.
 * Uses sql.query() for conventional function call with value placeholders.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: unknown[]): Promise<any[]> {
  const sql = getDb();
  // Use .query() method for conventional parameterized queries
  return sql.query(text, params ?? []);
}
