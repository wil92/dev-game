import {Controller, Get, Inject} from '../../core';
import {Users} from '../repositories';

@Controller({route: '/users'})
export default class UserController {

    @Inject(Users)
    usersRepository;

    @Get({route: '/'})
    async users(req, res) {
        const users = await this.usersRepository.list();
        res.send(users);
    }
}
