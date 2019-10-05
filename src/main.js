'use strict';

const sourceHarvest = require('source.harvest');

exports.loop = function() {
    // const room = Game.spawns.Spawn1.room;
    // const source = room.find(FIND_SOURCES)[0];
    // sourceHarvest(source);

    const spawn = Game.spawns.Spawn1;
    const creepCountBefore = _.size(Game.creeps);
    if (spawn.spawnCreep([MOVE], `move_${Game.time}`) === OK) {
        const creepCountAfter = _.size(Game.creeps);
        console.log(`Tick: ${Game.time}. CreepCount ${creepCountBefore} -> ${creepCountAfter}`);
    }
};
