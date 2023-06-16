import { RunResult, Database } from 'better-sqlite3';
import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

type BetterSQLite3Database<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'sync', RunResult, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Database, config?: DrizzleConfig<TSchema>): BetterSQLite3Database<TSchema>;

export { BetterSQLite3Database as B, drizzle as d };
