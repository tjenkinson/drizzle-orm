'use strict';

var migrator = require('../migrator.cjs');
var relations = require('../relations-9f413b53.cjs');
require('node:crypto');
require('node:fs');
require('node:path');

async function migrate(db, callback, config) {
    const migrations = migrator.readMigrationFiles(config);
    const migrationTableCreate = relations.sql `
		CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		)
	`;
    await db.run(migrationTableCreate);
    const dbMigrations = await db.values(relations.sql `SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`);
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

exports.migrate = migrate;
//# sourceMappingURL=migrator.cjs.map