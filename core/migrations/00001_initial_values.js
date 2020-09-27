import {MigrationVersion} from "../migrate";
import Points from "../../api/models/points";
import User from "../../api/models/user";

const INITIAL_POINTS = 1500;

@MigrationVersion('1.0')
export class Migrate {
    async migrate(database) {
        const pointsModel = database.getModel(Points);
        const userModel = database.getModel(User);

        const users = await userModel.find();
        for (let user of users) {
            const userPoints = await pointsModel.countDocuments({user: user._id});
            if (userPoints === 0) {
                await pointsModel.create({value: INITIAL_POINTS, user: user._id});
                await userModel.update({_id: user._id}, {points: INITIAL_POINTS});
            }
        }
    }
}

export default new Migrate();
