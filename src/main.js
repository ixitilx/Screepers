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

function findEnergy(type=RESOURCE_ENERGY) {
    const droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {resourceType:type});
    _.each(droppedEnergy, console.log);
};

defineProperty(Room, 'sources', findSources);
Room.prototype.findEnergy = findEnergy;

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

function containerSpot() {
    // if (this.memory.containerSpot) {
    //     return new RoomPosition(
    //         this.memory.containerSpot.x,
    //         this.memory.containerSpot.y,
    //         this.room.name);
    // }
    const spawn = Game.spawns.Spawn1;
    const spots = this.spots;
    const path = PathFinder.search(spawn.pos, this.spots, {plainCost:2, maxRooms:1});
    if (path.incomplete) {
        throw new Error(`Cannot find complete path from ${spawn} to ${this.spots}`);
    }

    // this.room.visual.poly(path.path);
    const spot = _.last(path.path);
    this.memory.containerSpot = {x: spot.x, y: spot.y};
    return spot;
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
defineProperty(Source, 'containerSpot', containerSpot);

// ------------

function cargoSize() {
    return _.sum(this.carry);
};

defineProperty(Creep, 'carryNow', cargoSize);

// ------------

function findSpawnSpots() {
    const p = this.pos;
    const sides = [
        new RoomPosition(p.x-1, p.y, p.roomName),
        new RoomPosition(p.x+1, p.y, p.roomName),
        new RoomPosition(p.x, p.y-1, p.roomName),
        new RoomPosition(p.x, p.y+1, p.roomName)];
    return _.filter(sides, p => p.lookFor(LOOK_TERRAIN) !== 'wall');
};

defineProperty(StructureSpawn, 'spots', findSpawnSpots);

// ------------

function drawSpots(source) {
    const visual = source.room.visual;
    _.each(source.spots, pos => visual.circle(pos, {fill:'Yellow'}));
    visual.circle(source.containerSpot, {fill: 'Red'});
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
    _(Game.spawns).map(s => s.spots)
                  .flatten()
                  .each(p => Game.rooms[p.roomName].visual.circle(p, {fill: 'Red'}))
                  .value();

    _(Game.rooms).map(r => r.sources).flatten().each(harvestSource).value();
    _.each(Game.rooms, r => r.findEnergy());
};
