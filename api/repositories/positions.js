import {Inject, Injectable} from '../../core';
import {Database} from '../services/database';
import Position from "../models/position";

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
        const orderedStanding = standing.sort((a, b) => a.standing > b.standing);
        await this.model.create({users: orderedStanding.map(s => s.userId)});
    }
}
