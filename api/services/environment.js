import {Injectable} from '../../core';
import {randomName} from '../../game/utils';

@Injectable()
export class Environment {
    constructor() {
        this.env = process.env.NODE_ENV || 'development';

        this.githubClientId = process.env.GITHUB_CLIENT_ID || '';
        this.githubClientSecret = process.env.GITHUB_CLIENT_SECRET || '';

        this.jwtSecret = process.env.JWT_SECRET || randomName(10);
    }
}
