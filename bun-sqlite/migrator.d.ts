import { MigrationConfig } from '../migrator.js';
import { B as BunSQLiteDatabase } from '../driver.d-15b02b6b.js';
import 'bun:sqlite';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: BunSQLiteDatabase<TSchema>, config: string | MigrationConfig): void;

export { migrate };
