import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Provider from '../models/provider';

@Injectable()
export class Providers {

    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(Provider);
    }

    async list() {
        return this.model.find();
    }

    async findOne(query) {
        return this.model.findOne(query);
    }

    async create(data) {
        return this.model.create(data);
    }
}
