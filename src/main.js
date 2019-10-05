'use strict';

const sourceHarvest = require('source.harvest');

exports.loop = function() {
    // const room = Game.spawns.Spawn1.room;
    // const source = room.find(FIND_SOURCES)[0];
    // sourceHarvest(source);

    const spawn = _(Game.spawns).first();
    console.log(spawn);

    // const creepCountBefore = _.size(Game.creeps);
};
