import { MigrationConfig } from '../migrator.js';
import { S as SQLJsDatabase } from '../driver.d-207f5e76.js';
import 'sql.js';
import '../db.d-88f5988e.js';
import '../select.types.d-1bd49d37.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: SQLJsDatabase<TSchema>, config: string | MigrationConfig): void;

export { migrate };
