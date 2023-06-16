import { MigrationConfig } from '../migrator.js';
import { B as BetterSQLite3Database } from '../driver.d-21fd7f12.js';
import 'better-sqlite3';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: BetterSQLite3Database<TSchema>, config: string | MigrationConfig): void;

export { migrate };
