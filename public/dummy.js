export default `{
    run: function ({position, vision, velocity, players, health, attack, name}) {
        return this.getRandomMovement({position, vision, velocity});
    },
    getRandomMovement: function (mapInfo) {
        const movements = getValidMovements(mapInfo);
        const selection = movements[Math.floor(Math.random() * movements.length)];
        return {velocity: selection.velocity, direction: selection.direction};
    }
}
`;
