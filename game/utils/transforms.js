import {DIRECTION, INV_DIRECTION} from "./variables";

export function moveToPos(position, {direction, velocity}) {
    return {
        x: position.x + velocity * DIRECTION[direction][0],
        y: position.y + velocity * DIRECTION[direction][1]
    };
}

/**
 *
 * @param position {{x: number, y: number}}
 * @param nextPosition {{x: number, y: number}}
 * @return {{direction: number, velocity: number} | null}
 */
export function posToMove(position, nextPosition) {
    const dx = nextPosition.x - position.x, dy = nextPosition.y - position.y;
    if (Math.abs(dx) === Math.abs(dy) || dx === 0 || dy === 0) {
        const px = dx !== 0 ? dx / Math.abs(dx) : 0, py = dy !== 0 ? dy / Math.abs(dy) : 0;
        return {
            velocity: Math.max(Math.abs(dx), Math.abs(dy)),
            direction: INV_DIRECTION[px + 1][py + 1]
        };
    }
    return null;
}
