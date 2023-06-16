import { MigrationConfig } from '../migrator.js';
import { PlanetScaleDatabase } from './index.js';
import '@planetscale/database';
import '../column.d-66a08b85.js';
import '../select.types.d-e43b2599.js';
import '../select.types.d-1bd49d37.js';
import '../query-promise.d-d7b61248.js';
import 'mysql2/promise';

declare function migrate<TSchema extends Record<string, unknown>>(db: PlanetScaleDatabase<TSchema>, config: MigrationConfig): Promise<void>;

export { migrate };
