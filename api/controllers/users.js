import {Controller, Get, Inject} from '../../core';
import {Users} from '../repositories';
import {PointsRepository} from "../repositories/points";

@Controller({route: '/users'})
export default class UserController {

    @Inject(Users)
    usersRepository;

    @Inject(PointsRepository)
    pointsRepository;

    @Get({route: '/'})
    async users(req, res) {
        const users = await this.usersRepository.list();
        res.send(users);
    }

    @Get({route: '/by_username/:username'})
    async byUsername(req, res) {
        const user = await this.usersRepository.findOne({username: req.params.username});
        if (user) {
            return res.send(user);
        }
        res.status(404).send({error: 'user not found'});
    }

    @Get({route: '/points/:userId'})
    async points(req, res) {
        const points = await this.pointsRepository.pointsByUser(req.params.userId);
        res.send(points);
    }
}
