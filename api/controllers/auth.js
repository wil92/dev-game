import {Controller, Inject, Post} from '../../core';
import {ProvidersService} from '../services';

@Controller({route: '/auth'})
export default class AuthController {

    @Inject(ProvidersService)
    providers;

    @Post({route: '/:provider'})
    async login(req, res) {
        const loginRes = await this.providers.auth(req.params.provider, req.body.code);
        res.send(loginRes);
    }
}
