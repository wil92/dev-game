import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Strategy from "../models/strategy";

@Injectable()
export class Strategies {

    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(Strategy);
    }

    async list(query) {
        return await this.model.find(query);
    }

    async create(data) {
        return this.model.create(data);
    }

    async findOne(query) {
        return this.model.findOne(query);
    }

    async update(query, data) {
        const strategy = this.findOne(query);
        return this.model.update(query, {
            ...strategy,
            ...data
        });
    }
}
