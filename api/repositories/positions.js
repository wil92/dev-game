import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Position from "../models/position";
import User from "../models/user";
import Points from "../models/points";

const FACTOR = 8;

@Injectable()
export class Positions {

    @Inject(Database)
    database;

    constructor() {
        this.model = this.database.getModel(Position);
    }

    async list() {
        return await this.model.find();
    }

    /**
     *
     * @param standing {{name: string, health: number, id: string, username: string, userId: string, standing: number}[]}
     * @return {Promise<void>}
     */
    async saveGame(standing) {
        const orderedStanding = standing
            .filter(s => s.standing !== undefined && s.userId !== undefined)
            .sort((a, b) => a.standing > b.standing);
        await this.model.create({users: orderedStanding.map(s => s.userId)});
        await this.calculateNewPoints(orderedStanding);
    }

    /**
     *
     * @param standing {{name: string, health: number, id: string, username: string, userId: string, standing: number}[]}
     * @return {Promise<void>}
     */
    async calculateNewPoints(standing) {
        const idPos = new Map();
        const currentResult = [...new Array(standing.length)].map(() => [...new Array(standing.length)].fill(.5));

        for (let i = 0; i < standing.length; i++) {
            idPos.set(standing[i].userId.toString(), i);
            for (let j = i + 1; j < standing.length; j++) {
                const r = this.calculateResult(standing[i].standing, standing[j].standing);
                currentResult[i][j] = r;
                currentResult[j][i] = 1 - r;
            }
        }

        const userModel = this.database.getModel(User);
        const users = await userModel.find({_id: {$in: standing.map(s => s.userId)}});
        const newPoints = [...new Array(users.length)].fill(0);
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const p = this.calculateLogisticFunction(users[i].points, users[j].points);
                const ab = currentResult[idPos.get(users[i]._id.toString())][idPos.get(users[j]._id.toString())];
                const ba = currentResult[idPos.get(users[j]._id.toString())][idPos.get(users[i]._id.toString())];

                newPoints[idPos.get(users[i]._id.toString())] += ab - p;
                newPoints[idPos.get(users[j]._id.toString())] += ba - (1 - p);
            }
        }

        const pointsModel = this.database.getModel(Points);
        for (let i = 0; i < users.length; i++) {
            const points = users[i].points + FACTOR * newPoints[idPos.get(users[i]._id.toString())]
            await pointsModel.create({value: points, user: users[i]._id});
            await userModel.update({_id: users[i]._id}, {points: points});
        }
    }

    calculateLogisticFunction(a, b) {
        return 1 / (1 + Math.pow(10, (a - b) / 400));
    }

    calculateResult(a, b) {
        return a < b ? 1 : a > b ? 0 : .5;
    }
}
