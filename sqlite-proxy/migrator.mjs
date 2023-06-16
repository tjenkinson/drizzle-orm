import { readMigrationFiles } from '../migrator.mjs';
import { s as sql } from '../relations-3eb6fe55.mjs';
import 'node:crypto';
import 'node:fs';
import 'node:path';

async function migrate(db, callback, config) {
    const migrations = readMigrationFiles(config);
    const migrationTableCreate = sql `
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		)
	`;
    await db.run(migrationTableCreate);
    const dbMigrations = await db.values(sql `SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`);
    const lastDbMigration = dbMigrations[0] ?? undefined;
    const queriesToRun = [];
    for (const migration of migrations) {
        if (!lastDbMigration
            || Number(lastDbMigration[2]) < migration.folderMillis) {
            queriesToRun.push(...migration.sql, `INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES('${migration.hash}', '${migration.folderMillis}')`);
        }
    }
    await callback(queriesToRun);
}

export { migrate };
//# sourceMappingURL=migrator.mjs.map