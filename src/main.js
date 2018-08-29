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

    const sinks = _([spawns]).flatten()
                             .filter(s => s.energyLevel < 0)
                             .sortBy(s => -s.energyLevel)
                             .value();

    const sources = _([energy]).flatten()
                               .filter(s => s.energyLevel > 0)
                               .sortBy(s => -s.energyLevel)
                               .value();

    return {sinks, sources, haulers};
};

function buildHauler() {
    console.log('Building hauler!');
    const spawn = Game.spawns.Spawn1;
    const body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    const name = `hauler_${Game.time % 1500}`;
    return spawn.spawnCreep(body, name, {memory:memory});
};

function routeEnergy(sinks, sources, haulers) {
    if (_.size(sinks) === 0 || _.size(sources) === 0) {
        console.log('No sinks or sources');
        return;
    }

    if (_.size(haulers) === 0) {
        const ret = buildHauler();
        console.log('Building hauler!', ret);
        return;
    }

    for(const i=0; i<sinks.length; i++) {
        console.log(sinks[i]);
    }

    // console.log(`sinks: ${sinks}`);
    // console.log(`sources: ${sources}`);
    // console.log(`haulers: ${haulers}`);
};

exports.loop = function() {
    _.each(Game.spawns, s => s.drawSpots());
    _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
 
    const {sinks, sources, haulers} = collectEnergyData();
    routeEnergy(sinks, sources, haulers);
};
