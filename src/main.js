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
    const energy = _(Game.rooms).map(r => r.find(FIND_DROPPED_RESOURCES)).flatten()
                                .filter(r => {resourceType: 'energy'})
                                .value();

    const sinks = _.flatten([spawns]);
    const sources = _.flatten([energy]);

    console.log(`spawns: ${spawns}`);
    console.log(`energy: ${energy}`);
};

exports.loop = function() {
    _.each(Game.spawns, s => s.drawSpots());
    _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
    collectEnergyData();
};
