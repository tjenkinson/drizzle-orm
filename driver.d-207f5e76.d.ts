import { Database } from 'sql.js';
import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

type SQLJsDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'sync', void, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Database, config?: DrizzleConfig<TSchema>): SQLJsDatabase<TSchema>;

export { SQLJsDatabase as S, drizzle as d };