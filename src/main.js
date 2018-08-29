'use strict';

console.log(`Reinitialized at ${Game.time}`);

require('prototype.room');
require('prototype.source');
require('prototype.spawn');
require('prototype.creep');
require('prototype.resource');

const SourceManager = require('manager.source');

function collectEnergyData() {
    const spawns = _.map(Game.spawns);
    const haulers = _.filter(Game.creeps, c => _.startsWith(c.name, 'hauler'));
    const energy = _(Game.rooms).map(r => r.find(FIND_DROPPED_RESOURCES))
                                .flatten()
                                .filter(r => r.resourceType === 'energy')
                                .value();

    const sinks = _([spawns]).flatten().filter(s => s.energyLevel < 0).value();
    const sources = _([energy]).flatten().filter(s => s.energyLevel > 0).value();

    return {sinks, sources, haulers};
};

function routeEnergyData(sinks, sources, haulers) {
    console.log(`sinks: ${sinks}`);
    console.log(`sources: ${sources}`);
    console.log(`haulers: ${haulers}`);
};

exports.loop = function() {
    _.each(Game.spawns, s => s.drawSpots());
    _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
 
    const {sinks, sources, haulers} = collectEnergyData();
    routeEnergyData(sinks, sources, haulers);
};
