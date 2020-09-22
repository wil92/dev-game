import jwt from "jsonwebtoken";

import {Inject, Injectable} from '../../core';
import {Environment} from './environment';

@Injectable()
export class Jwt {

    @Inject(Environment)
    environment;

    constructor() {
        this.secret = this.environment.jwtSecret;
    }

    generateJwt(user) {
        const token = jwt.sign({username: user.username}, this.secret);
        return {
            token,
            username: user.username
        };
    }

    /**
     *
     * @param token {string}
     * @returns {boolean}
     */
    validateJwt(token) {
        return jwt.verify(token, this.secret);
    }
}
