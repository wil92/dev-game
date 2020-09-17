import UserController from './users';
import GameController from './game';

export function buildControllers() {
    return {
        UserController: new UserController(),
        GameController: new GameController()
    };
}
