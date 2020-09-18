import {Strategy} from './strategy';

const DIR = [[-1, 1], [0, 1], [1, 1], [-1, 0], [0, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];
const newStrategies = [];

export function addStrategy(strategy) {
    newStrategies.push(strategy);
}

const GRID_SIZE = 100;
const VISION_SIZE = 12;
const MAX_NUMBER_OF_STRATEGIES = 50;

export class Field {

    constructor() {
        this.createField();
        this.strategies = [];

        [...new Array(50)].forEach(() => {
            const strategy = new Strategy(
                '(function () {return {run: function ({position, vision, velocity}) {this.tmp();return {direction: Math.floor(Math.random() * 9), velocity: Math.floor(Math.random() * (velocity + 1))}}, tmp: function () {}};})();'
            );
            strategy.setPosition(this.randomNumber(GRID_SIZE), this.randomNumber(GRID_SIZE));
            this.strategies.push(strategy);
        });
    }

    createField() {
        this.grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            this.grid.push([]);
            for (let j = 0; j < GRID_SIZE; j++) {
                this.grid[i].push(0);
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
            this.grid[x][y] = 1;
        }
    }

    runIteration() {
        this.loadNewStrategies();
        this.executeStrategies();
        this.calculateDamageByField()
        this.calculateDamage();
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
                const sum = position.reduce((p, v) => p.attack + v, 0);
                position.forEach((strategy) => strategy.health -= (sum - strategy.attack) / (position.length - 1));
            }
        });
        this.strategies = this.strategies.filter(strategy => strategy.health > 0);
    }

    calculateDamageByField() {
    }

    loadNewStrategies() {
        while (MAX_NUMBER_OF_STRATEGIES >= this.strategies.length && newStrategies.length > 0) {
            const newStrategy = newStrategies.shift();
            newStrategy.setPosition(this.randomNumber(GRID_SIZE), this.randomNumber(GRID_SIZE));
            this.strategies.push(newStrategy);
        }
    }

    randomNumber(limit) {
        return Math.floor(Math.random() * limit);
    }

    executeStrategies() {
        this.strategies
            .map(strategy => strategy.execute({vision: this.extractVisionField(strategy.position)}))
            .forEach((result, index) => {
                const position = this.calculatePosition(result, this.strategies[index].position, this.strategies[index].velocity);
                if (this.validatePosition(position) && this.validateCollision(position)) {
                    this.strategies[index].setPosition(position.x, position.y);
                }
            });
    }

    validatePosition(position) {
        return position && position.x >= 0 && position.x < GRID_SIZE && position.y >= 0 && position.y < GRID_SIZE;
    }

    validateCollision(position) {
        return position && !this.grid[position.x][position.y];
    }

    calculatePosition(result, position, velocity) {
        if (this.checkResultDirection(result) && this.checkResultVelocity(result, velocity)) {
            return {
                x: (DIR[result.direction][0] * result.velocity) + position.x,
                y: (DIR[result.direction][1] * result.velocity) + position.y
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
}
