import {DIRECTION} from './variables';
import {FieldEnum} from '../enums';

/**
 *
 * @param mapInfo {{vision: [[number]], velocity: number, position: {x: number, y: number}}}
 * @returns {[{position: {x: number, y: number}, velocity: number, direction: number}]}
 */
export function validMovements(mapInfo) {
    const movements = [];
    const marked = new Set();
    for (let i = 0; i < DIRECTION.length; i++) {
        for (let j = 0; j <= mapInfo.velocity; j++) {
            const xpos = mapInfo.position.x + DIRECTION[i][0] * j;
            const ypos = mapInfo.position.y + DIRECTION[i][1] * j;
            if (xpos >= 0 && xpos < mapInfo.vision.length &&
                ypos >= 0 && ypos < mapInfo.vision[0].length &&
                mapInfo.vision[xpos][ypos] !== FieldEnum.BLOCK &&
                !marked.has(`${xpos}/${ypos}`)
            ) {
                marked.add(`${xpos}/${ypos}`);
                movements.push({position: {x: xpos, y: ypos}, velocity: j, direction: i});
            } else if (!marked.has(`${xpos}/${ypos}`)) {
                break;
            }
        }
    }
    return movements;
}
