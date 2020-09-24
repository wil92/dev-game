import {Strategy} from './strategy';
import gameConfig from '../config/game.json';
import {Inject} from '../core';
import {Environment, MessagesTypes, WebSocketConnection} from '../api/services';
import {FieldEnum} from './enums';
import {Eval} from './eval';
import {DIRECTION} from './utils';

const GRID_SIZE = 100;
const VISION_SIZE = 12;
const GAS_DAMAGE = 10;
const GAME_DURATION = 180000; // 3 minutes
const INITIAL_STORM_RATIO = Math.sqrt(2 * GRID_SIZE * GRID_SIZE);

export class Field {

    @Inject(WebSocketConnection)
    socketConnection;

    @Inject(Environment)
    environment;

    constructor() {
        this.interval = gameConfig[this.environment.env].interval;
        this.createField();
        this.stormCenter = {x: this.randomNumber(GRID_SIZE), y: this.randomNumber(GRID_SIZE)};
        this.strategies = [];
        this.standing = [];
        this.standingCount = 1;
        this.eval = new Eval();
    }

    /**
     * @param strategy {{code: string, name: string, id: string, username: string}}
     */
    addStrategy({code, name, username, id}) {
        const strategyIns = new Strategy(code, this.eval, name, username, id);
        do {
            strategyIns.setPosition(this.randomNumber(GRID_SIZE), this.randomNumber(GRID_SIZE));
        } while (this.grid[strategyIns.position.x][strategyIns.position.y] === FieldEnum.BLOCK);
        this.strategies.push(strategyIns);
    }

    createField() {
        this.grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            this.grid.push([]);
            for (let j = 0; j < GRID_SIZE; j++) {
                this.grid[i].push(FieldEnum.FREE);
            }
        }
        for (let i = 0; i < Math.floor(GRID_SIZE * GRID_SIZE / 100); i++) {
            const x = this.randomNumber(GRID_SIZE);
            const y = this.randomNumber(GRID_SIZE);
            this.fillWall(x, y);
            this.fillWall(x + 1, y);
            this.fillWall(x, y + 1);
            this.fillWall(x + 1, y + 1);
        }
    }

    fillWall(x, y) {
        if (this.validatePosition({x, y})) {
            this.grid[x][y] = FieldEnum.BLOCK;
        }
    }

    async runIteration(gameTime) {
        await this.executeStrategies();
        this.calculateDamageByField();
        this.calculateDamage();
        this.closeGasCircle(gameTime);
    }

    closeGasCircle(gameTime) {
        gameTime = Math.min(gameTime, GAME_DURATION);
        const stormRatio = INITIAL_STORM_RATIO - (INITIAL_STORM_RATIO * gameTime / GAME_DURATION);
        let flagStormMove = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const distanceToTheStorm = Math.sqrt(Math.pow(i - this.stormCenter.x, 2) + Math.pow(j - this.stormCenter.y, 2));
                if (this.grid[i][j] === FieldEnum.FREE && (stormRatio === 0 || distanceToTheStorm > stormRatio)) {
                    this.grid[i][j] = FieldEnum.GAS;
                    flagStormMove = true;
                }
            }
        }
        if (flagStormMove) {
            this.socketConnection.broadcastMessage(MessagesTypes.MAP_UPDATE, this.grid);
        }
    }

    calculateDamage() {
        const positions = new Map();
        this.strategies.forEach(strategy => {
            const positionHash = `${strategy.position.x}/${strategy.position.y}`;
            if (positions.has(positionHash)) {
                positions.get(positionHash).push(strategy);
            } else {
                positions.set(positionHash, [strategy]);
            }
        });
        this.calculateDamageByPlayers(positions);
    }

    calculateDamageByPlayers(positions) {
        positions.forEach(position => {
            if (position.length > 1) {
                const sum = position.reduce((p, v) => v.attack + p, 0);
                position.forEach((strategy) => strategy.health -= (sum - strategy.attack) / (position.length - 1));
            }
        });
        const removed = this.strategies.filter(strategy => strategy.health <= 0 && strategy.id);
        if (removed.length > 0) {
            removed.forEach(strategy => this.standing.push({
                name: strategy.name,
                id: strategy.id,
                username: strategy.username,
                standing: this.standingCount,
                health: 0
            }));
            this.standingCount++;
        }
        this.strategies = this.strategies.filter(strategy => strategy.health > 0);
    }

    getStanding() {
        return [
            ...this.standing.map(s => ({...s, standing: this.standingCount - s.standing})),
            ...this.strategies.filter(s => s.id).map(s => ({
                name: s.name,
                id: s.id,
                username: s.username,
                health: s.health
            }))
        ].reverse();
    }

    calculateDamageByField() {
        this.strategies.forEach(strategy => {
            if (this.grid[strategy.position.x][strategy.position.y] === FieldEnum.GAS) {
                strategy.health -= GAS_DAMAGE;
            }
        });
    }

    randomNumber(limit) {
        return Math.floor(Math.random() * limit);
    }

    async executeStrategies() {
        for (let strategy of this.strategies) {
            const fieldInfo = {
                vision: this.extractVisionField(strategy.position),
                position: this.extractPlayerPositionInVisionField(strategy.position),
                players: this.closePlayers(strategy)
            };
            const result = await strategy.executeStrategy(fieldInfo);
            const position = this.calculatePosition(result, strategy.position, strategy.velocity);
            if (this.validatePosition(position) && this.validateCollision(position)) {
                strategy.setPosition(position.x, position.y);
            }
        }
    }

    closePlayers(strategy) {
        // toDo 25.09.20: improve this with a 2d segment-tree
        const x1 = Math.max(strategy.position.x - VISION_SIZE, 0);
        const x2 = Math.min(strategy.position.x + VISION_SIZE, GRID_SIZE - 1);
        const y1 = Math.max(strategy.position.y - VISION_SIZE, 0);
        const y2 = Math.min(strategy.position.y + VISION_SIZE, GRID_SIZE - 1);
        return this.strategies
            .filter(s => strategy.unique !== s.unique &&
                s.position.x >= x1 &&
                s.position.x <= x2 &&
                s.position.y >= y1 &&
                s.position.y <= y2)
            .map(s => ({position: s.position, health: s.health, attack: s.attack}));
    }

    validatePosition(position) {
        return position && position.x >= 0 && position.x < GRID_SIZE && position.y >= 0 && position.y < GRID_SIZE;
    }

    validateCollision(position) {
        return position && this.grid[position.x][position.y] !== FieldEnum.BLOCK;
    }

    calculatePosition(result, position, velocity) {
        if (this.checkResultDirection(result) && this.checkResultVelocity(result, velocity)) {
            return {
                x: (DIRECTION[result.direction][0] * result.velocity) + position.x,
                y: (DIRECTION[result.direction][1] * result.velocity) + position.y
            };
        }
        return null;
    }

    checkResultDirection(result) {
        return !(!result || typeof result.direction !== 'number' || result.direction < 0 || result.direction > 8);
    }

    checkResultVelocity(result, velocity) {
        return !(!result || typeof result.velocity !== 'number' || result.velocity < 0 || result.velocity > velocity);
    }

    extractVisionField(strategyPosition) {
        const x1 = Math.max(strategyPosition.x - VISION_SIZE, 0);
        const x2 = Math.min(strategyPosition.x + VISION_SIZE, GRID_SIZE - 1);
        const y1 = Math.max(strategyPosition.y - VISION_SIZE, 0);
        const y2 = Math.min(strategyPosition.y + VISION_SIZE, GRID_SIZE - 1);

        const vision = [];
        for (let i = x1; i <= x2; i++) {
            vision.push([]);
            for (let j = y1; j <= y2; j++) {
                vision[i - x1].push(this.grid[i][j]);
            }
        }

        return vision;
    }

    /**
     *
     * @param strategyPosition {{x: number, y:number}}
     * @returns {{x: number, y: number}}
     */
    extractPlayerPositionInVisionField(strategyPosition) {
        const x1 = Math.max(strategyPosition.x - VISION_SIZE, 0);
        const y1 = Math.max(strategyPosition.y - VISION_SIZE, 0);
        return {x: strategyPosition.x - x1, y: strategyPosition.y - y1};
    }
}
