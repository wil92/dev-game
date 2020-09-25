import chai from 'chai';

import {moveToPos, posToMove} from "../../../../game/utils";

const expect = chai.expect;

describe('transforms', () => {
    describe('moveToPos', () => {
        it('should get a correct position', () => {
            expect(moveToPos({x: 4, y: 5}, {direction: 0, velocity: 1})).to.deep.equal({x: 3, y: 6});
            expect(moveToPos({x: 4, y: 5}, {direction: 4, velocity: 2})).to.deep.equal({x: 4, y: 5});
            expect(moveToPos({x: 4, y: 5}, {direction: 8, velocity: 2})).to.deep.equal({x: 6, y: 3});
            expect(moveToPos({x: 4, y: 5}, {direction: 7, velocity: 3})).to.deep.equal({x: 4, y: 2});
            expect(moveToPos({x: 4, y: 5}, {direction: 1, velocity: 0})).to.deep.equal({x: 4, y: 5});
        });
    });

    describe('posToMove', () => {
        it('should get a correct move', () => {
            expect(posToMove({x: 0, y: 0}, {x: 4, y: 4})).to.deep.equal({
                velocity: 4,
                direction: 2
            });
            expect(posToMove({x: 2, y: 4}, {x: 4, y: 2})).to.deep.equal({
                velocity: 2,
                direction: 8
            });
            expect(posToMove({x: 0, y: 0}, {x: 0, y: 4})).to.deep.equal({
                velocity: 4,
                direction: 1
            });
            expect(posToMove({x: 2, y: 2}, {x: 2, y: 0})).to.deep.equal({
                velocity: 2,
                direction: 7
            });
            expect(posToMove({x: 4, y: 0}, {x: 0, y: 4})).to.deep.equal({
                velocity: 4,
                direction: 0
            });
            expect(posToMove({x: 3, y: 2}, {x: 1, y: 2})).to.deep.equal({
                velocity: 2,
                direction: 3
            });
            expect(posToMove({x: 0, y: 0}, {x: 0, y: 0})).to.deep.equal({
                velocity: 0,
                direction: 4
            });
            expect(posToMove({x: 2, y: 0}, {x: 4, y: 0})).to.deep.equal({
                velocity: 2,
                direction: 5
            });
            expect(posToMove({x: 4, y: 1}, {x: 3, y: 0})).to.deep.equal({
                velocity: 1,
                direction: 6
            });
        });

        it('should get null for invalid position', () => {
            expect(posToMove({x: 0, y: 0}, {x: 4, y: 2})).to.be.equal(null);
            expect(posToMove({x: 3, y: 2}, {x: 2, y: 0})).to.be.equal(null);
            expect(posToMove({x: 1, y: 4}, {x: 2, y: 0})).to.be.equal(null);
        });
    });
});
