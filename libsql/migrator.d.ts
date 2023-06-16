import { MigrationConfig } from '../migrator.js';
import { L as LibSQLDatabase } from '../driver.d-091c7513.js';
import '@libsql/client';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: LibSQLDatabase<TSchema>, config: MigrationConfig): Promise<void>;

export { migrate };
