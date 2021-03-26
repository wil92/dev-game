import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Position from "../models/position";
import User from "../models/user";
import Points from "../models/points";

const FACTOR = 8;

/**
 * @public model {Position}
 */
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
        const standingIns = await this.model.create({users: orderedStanding.map(s => s.userId)});
        await this.calculateNewPoints(orderedStanding, standingIns);
    }

    /**
     *
     * @param standing {{name: string, health: number, id: string, username: string, userId: string, standing: number}[]}
     * @param standingIns {Position}
     * @return {Promise<void>}
     */
    async calculateNewPoints(standing, standingIns) {
        const userModel = this.database.getModel(User);
        const users = await userModel.find({_id: {$in: standing.map(s => s.userId)}});
        const newPoints = [...new Array(users.length)].fill(0);
        const userById = new Map();
        users.forEach(user => userById.set(user._id.toString(), user));
        standing = standing.filter(value => userById.has(value.userId.toString()));

        const winUser = standing.reduce((p, u, i) => standing[p].standing < u.standing ? p : i, 0);

        for (let i = 0; i < standing.length; i++) {
            for (let j = 0; j < standing.length; j++) {
                if (i === j) continue;
                const userA = userById.get(standing[i].userId.toString());
                const userB = userById.get(standing[j].userId.toString());
                const p = this.calculateLogisticFunction(userA.points, userB.points);
                const ab = this.calculateResult(standing[i].standing, standing[j].standing);
                newPoints[i] += ab - p;
            }
        }

        const pointsModel = this.database.getModel(Points);
        for (let i = 0; i < standing.length; i++) {
            const user = userById.get(standing[i].userId.toString());
            const diff = FACTOR * newPoints[i];
            const points = user.points + diff;
            await pointsModel.create({
                value: points,
                user: user._id,
                difference: diff,
                position: standing[i].standing,
                standing: standingIns._id,
                createdAt: standingIns.createdAt
            });
            const winValue = user._id.toString() === standing[winUser].userId.toString() ? 1 : 0;
            await userModel.update({_id: user._id}, {
                points: points,
                wins: (user.wins || 0) + winValue,
                total: (user.total || 0) + 1
            });
        }
    }

    calculateLogisticFunction(a, b) {
        return 1.0 / (1.0 + Math.pow(10.0, (b - a) / 400.0));
    }

    calculateResult(a, b) {
        return a < b ? 1.0 : a > b ? 0 : .5;
    }
}
