'use strict';

console.log(`Reinitialized at ${Game.time}`);

require('prototype.room');
require('prototype.source');
require('prototype.spawn');
require('prototype.creep');

const SourceManager = require('manager.source');

function collectEnergyData() {
    const spawns = Game.spawns;
    const haulers = _.filter(Game.creeps, c => _.startsWith(c.name, 'hauler'));
    const energy = _(Game.rooms).map(r => r.find(FIND_DROPPED_RESOURCES)).flatten().value();
    console.log(energy);
};

exports.loop = function() {
    _.each(Game.spawns, s => s.drawSpots());
    _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
    collectEnergyData();
};
