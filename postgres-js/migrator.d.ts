import { MigrationConfig } from '../migrator.js';
import { PostgresJsDatabase } from './index.js';
import 'postgres';
import '../db.d-a6fe1b19.js';
import '../column.d-66a08b85.js';
import '../query-promise.d-d7b61248.js';
import '../select.types.d-1bd49d37.js';

declare function migrate<TSchema extends Record<string, unknown>>(db: PostgresJsDatabase<TSchema>, config: string | MigrationConfig): Promise<void>;

export { migrate };
