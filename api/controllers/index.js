import UserController from './users';
import GameController from './game';
import AuthController from './auth';

export function buildControllers() {
    return {
        UserController: new UserController(),
        GameController: new GameController(),
        AuthController: new AuthController()
    };
}
