import {MigrationVersion} from "../migrate";
import User from "../../api/models/user";
import Position from "../../api/models/position";
import Points from "../../api/models/points";

const FACTOR = 8;

@MigrationVersion('1.5')
export class Migrate {
    async migrate(database) {
        this.database = database;
        const positionsModel = database.getModel(Position);
        const pointsModel = this.database.getModel(Points);
        const userModel = this.database.getModel(User);

        await pointsModel.deleteMany({});

        const users = await userModel.find({});
        for (let user of users) {
            await userModel.update({_id: user._id}, {
                points: 1500,
                total: 0,
                wins: 0,
            });
            await pointsModel.create({
                value: 1500,
                user: user._id,
                createdAt: user.createdAt
            });
        }
        const positions = await positionsModel.find();

        for (let position of positions) {
            const standing = position.users.map((userId, standing) => ({userId: userId.toString(), standing}));
            await this.calculateNewPoints(standing, position);
        }
    }

    /**
     *
     * @param standing {{userId: string, standing: number}[]}
     * @param standingIns {Position}
     * @return {Promise<void>}
     */
    async calculateNewPoints(standing, standingIns) {
        const userModel = this.database.getModel(User);
        const users = await userModel.find({_id: {$in: standing.map(s => s.userId)}});
        const newPoints = [...new Array(users.length)].fill(0);
        const userById = new Map();
        users.forEach(user => userById.set(user._id.toString(), user));
        standing = standing.filter(value => userById.has(value.userId));

        const winUser = standing.reduce((p, u, i) => standing[p].standing < u.standing ? p : i, 0);

        for (let i = 0; i < standing.length; i++) {
            for (let j = 0; j < standing.length; j++) {
                if (i === j) continue;
                const userA = userById.get(standing[i].userId);
                const userB = userById.get(standing[j].userId);
                const p = this.calculateLogisticFunction(userA.points, userB.points);
                const ab = this.calculateResult(standing[i].standing, standing[j].standing);
                newPoints[i] += ab - p;
            }
        }

        const pointsModel = this.database.getModel(Points);
        for (let i = 0; i < standing.length; i++) {
            const user = userById.get(standing[i].userId);
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
            const winValue = user._id.toString() === standing[winUser].userId ? 1 : 0;
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

export default new Migrate();
