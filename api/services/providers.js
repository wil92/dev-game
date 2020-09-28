import jwt from 'jsonwebtoken';
import axios from 'axios';

import {Inject, Injectable} from '../../core';
import {Environment} from './environment';
import providersConfig from '../../config/providers.json';
import {Providers, Users} from '../repositories';
import {PointsRepository} from "../repositories/points";

@Injectable()
export class ProvidersService {

    @Inject(Environment)
    environment;

    @Inject(Providers)
    providersRepository;

    @Inject(Users)
    usersRepository;

    @Inject(PointsRepository)
    pointsRepository;

    constructor() {
    }

    /**
     *
     * @param provider {string}
     * @param code {string}
     */
    async auth(provider, code) {
        const result = await this.authGithub(provider, code);
        if (result.access_token) {
            const userData = await this.githubUser(result.access_token);
            let providerObj = await this.providersRepository.findOne({username: userData.username});
            if (!providerObj) {
                providerObj = await this.createUserProvider({...userData, provider});
            }
            return this.generateJwtByProvider(providerObj);
        }
    }

    async generateJwtByProvider(provider) {
        const user = await this.usersRepository.findOne({providers: [ provider._id ]});
        const token = jwt.sign({username: user.username}, this.environment.jwtSecret);
        return {
            token,
            username: user.username
        };
    }

    /**
     *
     * @param data {{provider: string, scope: string, username: string, avatar: string, url: string, token: string}}
     * @returns {Promise<void>}
     */
    async createUserProvider(data) {
        const newProvider = await this.providersRepository.create({
            provider: data.provider,
            scope: data.scope,
            username: data.username,
            avatar: data.avatar,
            url: data.url,
            token: data.token
        });
        const user = await this.usersRepository.create({
            username: data.username,
            providers: [ newProvider ],
            points: 1500
        });
        await this.pointsRepository.addPoints(1500, user);
        return this.providersRepository.findOne({username: data.username});
    }

    /**
     *
     * @param accessToken {string}
     * @returns {Promise<{name: string, avatar: string, url: string, email: string, username: string, token: string}>}
     */
    async githubUser(accessToken) {
        const req = await axios.get('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        });
        return {
            username: req.data.login,
            avatar: req.data.avatar_url,
            url: req.data.html_url,
            name: req.data.name,
            email: req.data.email,
            token: accessToken
        };
    }

    /**
     *
     * @param provider {string}
     * @param code {string}
     * @returns {Promise<{access_token: string, scope: string, token_type: string}>}
     */
    async authGithub(provider, code) {
        if (providersConfig[this.environment.env].github) {
            const req = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: this.environment.githubClientId,
                client_secret: this.environment.githubClientSecret,
                code,
            }, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return req.data;
        }
        return null;
    }
}
