import {Controller, Get, Inject} from '../../core';
import {Users} from '../repositories';
import {Auth} from '../middlewares/auth';

@Controller({route: '/users'})
export default class UserController {

    @Inject(Users)
    usersService;

    @Get({route: '/', middlewares: Auth})
    async users(req, res) {
        const users = await this.usersService.list();
        res.send(users);
    }
}
