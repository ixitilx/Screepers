'use strict';

console.log(`Reinitialized at ${Game.time}`);

require('prototype.room');
require('prototype.source');
require('prototype.spawn');
require('prototype.creep');

function buildHarvester(source) {
    // console.log(`in buildHarvester(${source})`);
    const spawn = Game.spawns.Spawn1;
    const body = [WORK, WORK, CARRY, MOVE];
    const name = `harvester_${Game.time % 1500}`;
    const memory = {source: source.id};
    return spawn.spawnCreep(body, name, {memory:memory});
};

function runHarvester(creep, spot, source) {
    if (!creep.pos.isEqualTo(spot)) {
        creep.moveTo(spot);
        return;
    }

    creep.harvest(source);
};

function runHarvesters(source) {
    const harvoSpots = _.zip(source.spots, source.harvesters);
    _(harvoSpots).filter(hs => hs[0] && hs[1])
                 .each(hs => runHarvester(hs[1], hs[0], source))
                 .value();
};

function buildHarvesters(source) {
    const harvesters = source.harvesters;
    const spots = source.spots;

    if (_.size(harvesters) < _.size(spots)) {
        buildHarvester(source);
    }
};

function harvestSource(source) {
    source.drawSpots();
    runHarvesters(source);
    buildHarvesters(source);
};

exports.loop = function() {
    _(Game.spawns).map(s => s.spots)
                  .flatten()
                  .each(p => Game.rooms[p.roomName].visual.circle(p, {fill: 'Red'}))
                  .value();

    _(Game.rooms).map(r => r.sources).flatten().each(harvestSource).value();
    _.each(Game.rooms, r => r.findEnergy());
};
