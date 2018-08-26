'use strict';

function defineProperty(className, name, impl, enumerable=false, configurable=true) {
    const descriptor = {
        get: impl,
        enumerable: enumerable,
        configurable: configurable,
    };

    Object.defineProperty(className.prototype, name, descriptor);
};

// -------------

function findSources() {
    return this.find(FIND_SOURCES);
};

defineProperty(Room, 'sources', findSources);

// -------------

function findSpots() {
    // console.log(`in findSpots(${this})`);
    const pos = this.pos;
    const room = this.room;
    const terra = room.lookForAtArea(
                    LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
    return _(terra).filter(t => t.terrain === 'plain' || t.terrain === 'swamp')
                   .map(t => new RoomPosition(t.x, t.y, room.name))
                   .value();
};

function getSourceMemory() {
    return _.get(Memory, `sources.${this.id}`, {});
};

function getHarvesters() {
    return _.filter(Game.creeps, c => c.memory.source === this.id);
};

defineProperty(Source, 'memory', getSourceMemory);
defineProperty(Source, 'spots', findSpots);
defineProperty(Source, 'harvesters', getHarvesters);

// ------------

function drawSpots(source) {
    _.each(source.spots, pos => Game.rooms[pos.roomName].visual.circle(pos, {fill:'Yellow'}));
};

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
        const ret = creep.moveTo(spot);
    } else {
        const ret = creep.harvest(source);
    }
};

function runHarvesters(source) {
    const harvoSpots = _.zip(source.spots, source.harvesters);
    _(harvoSpots).filter(hs => hs[0] && hs[1])
                 .each(hs => runHarvester(hs[1], hs[0], source))
                 .value();
};

function buildHarvesters(source) {
    // console.log(`in buildHarvesters(${source})`);
    const harvesters = source.harvesters;
    const spots = source.spots;
    // console.log(`spots: ${JSON.stringify(spots)}`);
    // console.log(`harvesters: ${JSON.stringify(harvesters)}`);

    if (_.size(harvesters) < _.size(spots)) {
        buildHarvester(source);
    }
};

function harvestSource(source) {
    drawSpots(source);
    runHarvesters(source);
    buildHarvesters(source);
};

exports.loop = function() {
    _(Game.rooms).map(r => r.sources).flatten().each(harvestSource).value();
};
