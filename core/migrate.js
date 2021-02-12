import fs from 'fs';

import {Inject} from "./injection";
import {Database} from "../api/services/database";
import Migration from "../api/models/migration";

export function MigrationVersion(version) {
    return function (target) {
        return class extends target {
            constructor(...args) {
                super(...args);
                this.version = version;

                const migrate = this.migrate.bind(this);
                this.migrate = async (...props) => {
                    console.log('Applied migration', this.version);
                    return migrate(...props);
                }
            }
        };
    };
}

export class Migrate {
    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(Migration);
    }

    async executeMigrations() {
        const migrationsPath = `${__dirname}/migrations`;
        const migrations = fs.readdirSync(migrationsPath);
        for(let m of migrations) {
            const v = await import(`${migrationsPath}/${m}`);
            const migration = v.default;
            const isReady = await this.checkVersion(migration.version);
            if (!isReady) {
                try {
                    await migration.migrate(this.database);
                    await this.markVersion(migration.version);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    async checkVersion(version) {
        const m = await this.model.findOne({version});
        return m !== null;
    }

    async markVersion(version) {
        await this.model.create({version});
    }
}

export default new Migrate();
