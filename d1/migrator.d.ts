import { MigrationConfig } from '../migrator.js';
import { D as DrizzleD1Database } from '../driver.d-24c7a029.js';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: DrizzleD1Database<TSchema>, config: string | MigrationConfig): Promise<void>;

export { migrate };
