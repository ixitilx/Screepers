'use strict';

function buildHarvester(source) {
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

module.exports = harvestSource;
