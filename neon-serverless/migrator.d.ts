import { MigrationConfig } from '../migrator.js';
import { NeonDatabase } from './index.js';
import '../column.d-66a08b85.js';
import '../db.d-a6fe1b19.js';
import '../query-promise.d-d7b61248.js';
import '../select.types.d-1bd49d37.js';
import '@neondatabase/serverless';

declare function migrate<TSchema extends Record<string, unknown>>(db: NeonDatabase<TSchema>, config: string | MigrationConfig): Promise<void>;

export { migrate };
