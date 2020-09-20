import chai from 'chai';

import {
    validateDirection, validateInsideMovement,
    validateOutsideMovement,
    validateResponseStructure,
    validateVelocity
} from '../../../../game/utils';

const expect = chai.expect;

const VISION_EXAMPLE = [
//  -|---> (y)
//   |
//   v
//  (x)
//    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 20 21 22 23
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 0
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 1
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 2
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 3
    [ 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 4
    [ 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 5
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 6
    [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 7
    [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 8
    [ 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 9
    [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 10
    [ 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 11
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 12
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 13
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 14
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 15
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // 16
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]  // 17
];

describe('validator', () => {
    describe('validateInsideMovement', () => {
        it('should validate a valid movement', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 15, y: 3}, velocity: 2};
            const result = {velocity: 2, direction: 2};
            expect(validateInsideMovement(info, result)).to.be.true;
        });

        it('should validate an invalid movement 1', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 9, y: 8}, velocity: 2};
            const result = {velocity: 2, direction: 2};
            expect(validateInsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement 2', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 15, y: 8}, velocity: 2};
            const result = {velocity: 2, direction: 0};
            expect(validateInsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement 3', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 3, y: 6}, velocity: 2};
            const result = {velocity: 1, direction: 2};
            expect(validateInsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement 4', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 6, y: 7}, velocity: 2};
            const result = {velocity: 1, direction: 3};
            expect(validateInsideMovement(info, result)).to.be.false;
        });
    });
    describe('validateResponseStructure', () => {
        it('should validate a valid response structure', () => {
            const resultTest = {direction: 1, velocity: 2};
            expect(validateResponseStructure(resultTest)).to.be.true;
        });

        it('should validate an invalid response structure 1', () => {
            const resultTest = {direction: 1};
            expect(validateResponseStructure(resultTest)).to.be.false;
        });

        it('should validate an invalid response structure 2', () => {
            const resultTest = {velocity: 4};
            expect(validateResponseStructure(resultTest)).to.be.false;
        });

        it('should validate an invalid response structure 3', () => {
            const resultTest = {};
            expect(validateResponseStructure(resultTest)).to.be.false;
        });

        it('should validate an invalid response structure 4', () => {
            const resultTest = {direction: 1, velocity: 2, invalidAttribute: 'test'};
            expect(validateResponseStructure(resultTest)).to.be.false;
        });

        it('should validate an invalid response structure 5', () => {
            expect(validateResponseStructure(null)).to.be.false;
            expect(validateResponseStructure(undefined)).to.be.false;
        });

        it('should validate an invalid response structure 6', () => {
            expect(validateResponseStructure(123)).to.be.false;
        });
    });

    describe('validateDirection', () => {
        it('should validate a valid direction', () => {
            expect(validateDirection(4)).to.be.true;
        });

        it('should validate an invalid direction 1', () => {
            expect(validateDirection(-1)).to.be.false;
        });

        it('should validate an invalid direction 2', () => {
            expect(validateDirection(10)).to.be.false;
        });
    });

    describe('validateVelocity', () => {
        it('should validate a valid velocity', () => {
            expect(validateVelocity(4, 4)).to.be.true;
            expect(validateVelocity(4, 0)).to.be.true;
        });

        it('should validate an invalid velocity 1', () => {
            expect(validateVelocity(4, -2)).to.be.false;
        });

        it('should validate an invalid velocity 2', () => {
            expect(validateVelocity(4, 5)).to.be.false;
        });
    });

    describe('validateOutsideMovement', () => {
        it('should validate a valid movement inside the vision area', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 1, y: 1}, velocity: 2};
            const result = {velocity: 1, direction: 6};
            expect(validateOutsideMovement(info, result)).to.be.true;
        });

        it('should validate an invalid movement outside the vision area 1', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 1, y: 11}, velocity: 2};
            const result = {velocity: 2, direction: 3};
            expect(validateOutsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement outside the vision area 2', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 16, y: 11}, velocity: 2};
            const result = {velocity: 2, direction: 5};
            expect(validateOutsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement outside the vision area 3', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 8, y: 1}, velocity: 2};
            const result = {velocity: 2, direction: 7};
            expect(validateOutsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement outside the vision area 4', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 8, y: 22}, velocity: 2};
            const result = {velocity: 2, direction: 1};
            expect(validateOutsideMovement(info, result)).to.be.false;
        });

        it('should validate an invalid movement outside the vision area 4', () => {
            const info = {vision: VISION_EXAMPLE, position: {x: 16, y: 22}, velocity: 2};
            const result = {velocity: 2, direction: 2};
            expect(validateOutsideMovement(info, result)).to.be.false;
        });
    });
});
