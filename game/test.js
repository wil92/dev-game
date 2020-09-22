const cp = require('child_process');
const n = cp.fork('./game/processes/strategy-check.js');

n.on('message', (m) => {
    console.log('Eval result:', JSON.stringify(m));
    process.exit(0);
});

// Causes the child to print: CHILD got message: { hello: 'world' }
n.send({
    code: '(function () {\n    return {\n        run: function ({position, vision, velocity, players, health, attack, name}) {\n            return this.getRandomMovement({position, vision, velocity});\n        },\n        getRandomMovement: function (mapInfo) {\n            const movements = getValidMovements(mapInfo);\n            const selection = movements[Math.floor(Math.random() * movements.length)];\n            return {velocity: selection.velocity, direction: selection.direction};\n        }\n    };\n})();',
    id: 'test'
});
