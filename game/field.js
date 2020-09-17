import {Strategy} from './strategy';

const DIR = [ [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ -1, -1 ], [ 0, -1 ], [ 1, -1 ] ];
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

        [ ...new Array(4) ].forEach(() => {
            this.strategies.push(new Strategy(
                '(function () {return {run: function ({position, vision, velocity}) {this.tmp();return {direction: Math.floor(Math.random() * 9), velocity: Math.floor(Math.random() * (velocity + 1))}}, tmp: function () {}};})();'
            ));
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
    }

    runIteration() {
        this.loadNewStrategies();
        this.executeStrategies();
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
                if (this.validatePosition(position)) {
                    this.strategies[index].setPosition(position.x, position.y);
                }
            });
    }

    validatePosition(position) {
        return position && position.x >= 0 && position.x < GRID_SIZE && position.y >= 0 && position.y < GRID_SIZE;
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
