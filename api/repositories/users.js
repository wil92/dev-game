import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import User from '../models/user';

@Injectable()
export class Users {

    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(User);
    }

    async list() {
        return await this.model.find().sort({points: -1});
    }

    async findOne(query) {
        return this.model.findOne(query);
    }

    async create(data) {
        return this.model.create(data);
    }
}
