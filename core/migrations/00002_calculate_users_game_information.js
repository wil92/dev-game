import {MigrationVersion} from "../migrate";
import User from "../../api/models/user";
import Position from "../../api/models/position";

@MigrationVersion('1.4')
export class Migrate {
    async migrate(database) {
        const positionsModel = database.getModel(Position);
        const userModel = database.getModel(User);

        const winnersMap = new Map();
        const totalMap = new Map();

        const positions = await positionsModel.find();

        await userModel.updateMany({}, {wins: 0, total: 0});

        for (let position of positions) {
            let flagWinner = true;
            for (let user of position.users) {
                const userId = user.toString();
                if (flagWinner) {
                    winnersMap.set(userId, (winnersMap.get(userId) || 0) + 1);
                }
                flagWinner = false;
                totalMap.set(userId, (totalMap.get(userId) || 0) + 1);
            }
        }

        for (let [key, value] of winnersMap) {
            await userModel.update({_id: key}, {wins: value});
        }
        for (let [key, value] of totalMap) {
            await userModel.update({_id: key}, {total: value});
        }
    }
}

export default new Migrate();
