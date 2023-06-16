import { MigrationConfig } from '../migrator.js';
import { a as SqliteRemoteDatabase } from '../driver.d-00dad961.js';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

type ProxyMigrator = (migrationQueries: string[]) => Promise<void>;
declare function migrate<TSchema extends Record<string, unknown>>(db: SqliteRemoteDatabase<TSchema>, callback: ProxyMigrator, config: string | MigrationConfig): Promise<void>;

export { ProxyMigrator, migrate };
