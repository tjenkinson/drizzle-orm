/// <reference types="bun-types" />
import { Database } from 'bun:sqlite';
import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

type BunSQLiteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'sync', void, TSchema>;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(client: Database, config?: DrizzleConfig<TSchema>): BunSQLiteDatabase<TSchema>;

export { BunSQLiteDatabase as B, drizzle as d };