import { MigrationConfig } from '../../migrator.js';
import { AwsDataApiPgDatabase } from './index.js';
import '../../column.d-66a08b85.js';
import '../../db.d-a6fe1b19.js';
import '../../query-promise.d-d7b61248.js';
import '../../select.types.d-1bd49d37.js';
import '@aws-sdk/client-rds-data';

declare function migrate<TSchema extends Record<string, unknown>>(db: AwsDataApiPgDatabase<TSchema>, config: string | MigrationConfig): Promise<void>;

export { migrate };
