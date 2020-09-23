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

    async activate(id, user) {
        const strategy = await this.findOne({_id: id});
        if (strategy.valid) {
            await this.model.updateMany({user: user._id}, {active: false});
            return await this.update({_id: id}, {active: true});
        }
        return null;
    }

    async update(query, data) {
        const strategy = this.findOne(query);
        return this.model.update(query, {
            ...strategy,
            ...data
        });
    }
}
