import ObjectId from 'mongoose/lib/types/objectid';

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

    async pointsByUser(userId) {
        return new Promise((resolve, reject) => {
            this.model.aggregate([
                {"$match": {"user": ObjectId(userId)}},
                {"$sort": {"createdAt": 1}},
                {
                    "$group": {
                        "_id": {$substr: ['$createdAt', 5, 2]},
                        "pointId": {$last: "$_id"},
                        "createdAt": {$last: "$createdAt"}
                    }
                },
                {"$limit": 20}
            ]).exec((err, points) => {
                if (err) {
                    return reject(err);
                }
                resolve(points)
            });
        }).then(points => {
            return this.model.find({_id: {$in: points.map(p => p.pointId)}}).sort({createdAt: 'desc'});
        });
    }
}
