import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Points from "../models/points";

@Injectable()
export class PointsRepository {

    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(Points);
    }

    async addPoints(points, user) {
        return await this.model.create({value: points, user: user._id});
    }
}
