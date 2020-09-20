import {DIRECTION} from './variables';
import {FieldEnum} from '../enums';

/**
 *
 * @param mapInfo {{vision: [[number]], velocity: number, position: {x: number, y: number}}}
 * @param strategyResult {{direction: number, velocity: number}}
 * @returns {boolean}
 */
export function validateAction(mapInfo, strategyResult) {
    return validateResponseStructure(strategyResult) &&
        validateDirection(strategyResult.direction) &&
        validateVelocity(mapInfo.velocity, strategyResult.velocity) &&
        validateOutsideMovement(mapInfo, strategyResult) &&
        validateInsideMovement(mapInfo, strategyResult);
}

/**
 *
 * @param strategyResult {{direction: number, velocity: number}}
 * @returns {boolean}
 */
export function validateResponseStructure(strategyResult) {
    if (strategyResult && typeof strategyResult === 'object') {
        const keys = Object.keys(strategyResult).sort();
        return keys.length === 2 &&
            keys[0] === 'direction' &&
            keys[1] === 'velocity' &&
            typeof strategyResult[keys[0]] === 'number' &&
            typeof strategyResult[keys[1]] === 'number';
    }
    return false;
}

/**
 *
 * @param direction {number}
 * @returns {boolean}
 */
export function validateDirection(direction) {
    return 0 <= direction && direction <= 8;
}

/**
 *
 * @param maxVelocity {number}
 * @param resultStrategyVelocity {number}
 * @returns {boolean}
 */
export function validateVelocity(maxVelocity, resultStrategyVelocity) {
    return 0 <= resultStrategyVelocity && resultStrategyVelocity <= maxVelocity;
}

/**
 *
 * @param mapInfo {{vision: [[number]], velocity: number, position: {x: number, y: number}}}
 * @param strategyResult {{direction: number, velocity: number}}
 * @returns {boolean}
 */
export function validateOutsideMovement(mapInfo, strategyResult) {
    const xpos = DIRECTION[strategyResult.direction][0] * strategyResult.velocity + mapInfo.position.x;
    const ypos = DIRECTION[strategyResult.direction][1] * strategyResult.velocity + mapInfo.position.y;
    return xpos >= 0 && xpos < mapInfo.vision.length && ypos >=0 && ypos < mapInfo.vision.length;
}

/**
 *
 * @param mapInfo {{vision: [[number]], velocity: number, position: {x: number, y: number}}}
 * @param strategyResult {{direction: number, velocity: number}}
 * @returns {boolean}
 */
export function validateInsideMovement(mapInfo, strategyResult) {
    for (let i = 1; i <= strategyResult.velocity; i++) {
        const xpos = DIRECTION[strategyResult.direction][0] * i + mapInfo.position.x;
        const ypos = DIRECTION[strategyResult.direction][1] * i + mapInfo.position.y;
        if (mapInfo.vision[xpos][ypos] === FieldEnum.BLOCK) {
            return false;
        }
    }
    return true;
}
