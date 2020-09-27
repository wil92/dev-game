import {MigrationVersion} from "../migrate";
import Points from "../../api/models/points";
import User from "../../api/models/user";

@MigrationVersion('1.0')
export class Migrate {
    async migrate(database) {
        const pointsModel = database.getModel(Points);
        const userModel = database.getModel(User);

        const users = await userModel.find();
        for (let user of users) {
            const userPoints = await pointsModel.countDocuments({user: user._id});
            if (userPoints === 0) {
                await pointsModel.create({value: 1500, user: user._id});
            }
        }
    }
}

export default new Migrate();
