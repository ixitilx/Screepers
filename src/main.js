'use strict';

Object.defineProperty(Room.prototype, 'sources', {
    get: function() {
        return this.find(FIND_SOURCES);
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Source.prototype, 'spots', {
    get: function() {
        const pos = this.pos;
        const room = this.room;
        const terra = room.lookForAtArea(
                        LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
        return _(terra).filter(t => t.terrain === 'plain' || t.terrain === 'swamp')
                       .map(t => new RoomPosition(t.x, t.y, room.name))
                       .value();
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(Source.prototype, 'memory', {
    get: function() {
        return _.get(Memory, `sources.${this.id}`);
    },
    enumerable: false,
    configurable: true,
});

exports.loop = function() {
    const sources = _(Game.rooms).map(r => r.sources).flatten().value();
    const spots = _(sources).map(s => s.spots).flatten().value();
    console.log(`sources: ${sources}`);
    console.log(`spots: ${spots}`);
                 // .each(p => function(p){console.log(JSON.stringify(p)); return p;})
                 // .each(p => Game.rooms[p.roomName].visual.circle(p, {fill:'Yellow'}))
                 // .value();
};
