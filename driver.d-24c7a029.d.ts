/// <reference types="@cloudflare/workers-types" />
import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

type DrizzleD1Database<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'async', D1Result, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: D1Database, config?: DrizzleConfig<TSchema>): DrizzleD1Database<TSchema>;

export { DrizzleD1Database as D, drizzle as d };
