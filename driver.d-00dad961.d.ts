import { B as BaseSQLiteDatabase } from './db.d-88f5988e.js';
import { D as DrizzleConfig } from './column.d-66a08b85.js';

interface SqliteRemoteResult<T = unknown> {
    rows?: T[];
}
type SqliteRemoteDatabase<TSchema extends Record<string, unknown> = Record<string, never>> = BaseSQLiteDatabase<'async', SqliteRemoteResult, TSchema>;
type AsyncRemoteCallback = (sql: string, params: any[], method: 'run' | 'all' | 'values' | 'get') => Promise<{
    rows: any[];
}>;
type RemoteCallback = AsyncRemoteCallback;
declare function drizzle<TSchema extends Record<string, unknown> = Record<string, never>>(callback: RemoteCallback, config?: DrizzleConfig<TSchema>): SqliteRemoteDatabase<TSchema>;

export { AsyncRemoteCallback as A, RemoteCallback as R, SqliteRemoteResult as S, SqliteRemoteDatabase as a, drizzle as d };
