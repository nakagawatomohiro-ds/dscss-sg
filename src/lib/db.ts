import { neon } from "@neondatabase/serverless";

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

/**
 * Execute a parameterized query.
 * Neon's sql function is a tagged template literal by default,
 * but also accepts (query, params) syntax.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: unknown[]): Promise<any[]> {
  const sql = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sql as any)(text, params ?? []);
}
