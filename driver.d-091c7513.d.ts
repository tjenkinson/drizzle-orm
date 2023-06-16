import { ResultSet, Client } from '@libsql/client';
import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

type LibSQLDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'async', ResultSet, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Client, config?: DrizzleConfig<TSchema>): LibSQLDatabase<TSchema>;

export { LibSQLDatabase as L, drizzle as d };
