import UserController from './users';
import GameController from './game';
import AuthController from './auth';
import StrategyController from './strategies';

export function buildControllers() {
    return {
        UserController: new UserController(),
        GameController: new GameController(),
        AuthController: new AuthController(),
        StrategyController: new StrategyController()
    };
}
