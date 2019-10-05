'use strict';

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function getHarvesterSpots(source) {
    // Returns x,y coordinates of walkable tiles
    // Requires no inter-tick maintenance, since this never changes

    const p = source.pos;
    const terrain = source.room.lookForAtArea(LOOK_TERRAIN, p.y-1, p.x-1, p.y+1, p.x+1, true);

    const isWalkable = t => t.terrain === 'swamp' || t.terrain === 'plain';
    const pickPos = t => _.pick(t, ['x', 'y']);
    const walkable = _(terrain).filter(isWalkable).map(pickPos).value();

    return walkable;
};

function getFreeSpotCount(source) {
    const harvesterSpots = getHarvesterSpots(source);
    return _.size(harvesterSpots);
};

function getAssignedCreeps(sourceId) {
    return _.filter(Game.creeps, creep => creep.memory.assignedId === sourceId);
};

function getCurrentWork(source) {
    const getBodyWork = creep => 0; // TODO
    const harvesters = getAssignedCreeps(source.id);
    return _(harvesters).map(getBodyWork).sum();
};

function getMaxWork(energyCapacity) {
    // Calculates number of WORK modules required to drain source
    // "0 | x" forces js compiler to pass integer part of "x" to | operation
    // "0 | x" always evaluates to x
    return 0 | Math.ceil(energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME));
};

function needHarvester(source) {
    const freeSpotCount = getFreeSpotCount(source);
    const currentWork = getCurrentWork(source);
    const maxWork = getMaxWork(source.energyCapacity);
    return needHarvester2(freeSpots, currentWork, maxWork);
};

function needHarvester2(freeSpots, currentWork, maxWork) {
    return freeSpots > 0 && currentWork < maxWork;
};

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function posToIdx(pos) {
    return pos.x + pos.y * 50;
};

function idxToPos(idx) {
    return {x: Math.floor(idx / 50), y: Math.floor(idx % 50)};
};

function getSourceData(source) {
    const path = ['sources', source.id];

    if (!_.has(Memory, path)) {
        const data = {
            'room': source.room.name,
            'x': source.pos.x,
            'y': source.pos.y,
            'spots': getHarvesterSpots(source),
        };
        _.set(Memory, path, data);
    }

    return _.get(Memory, path);
};

function removeUnmatchedUnit(sourceId, spot) {
    if (!spot.id)
        return;

    const unit = Game.getObjectById(spot.id);
    if (!unit) {
        spot.id = null;
        return;
    }

    if (unit.memory.owner !== sourceId) {
        spot.id = null;
        return;
    }
};

function spawnUnit(sourceId) {
    const body = [WORK, CARRY, MOVE];
    const name = `harvester_${Game.time}`;
    const memory = {
        owner: sourceId
    };

    const status = Game.spawns.Spawn1.spawnCreep(body, name, {memory: memory});
    // why do we care about the status, exactly?
};

function findCreep(sourceId, spot, myCreeps) {
    const creep = _(Game.creeps)
                        .filter(c => c.memory.owner === sourceId)
                        .filter(c => undefined === _.find(myCreeps, c.id))
                        .first();
};

function getCreep(source, spot, workNeeded, myCreeps) {
    // Scan through existing idle units and pick some if fits
    // Try to create unit
    const creep = findCreep(source.id, spot, myCreeps);
    if (creep)
        return creep;
    spawnUnit(source.id);
};

module.exports = function(source) {
    // every source maintains spot-to-harvester mapping
    const data = getSourceData(source);

    // remove unnecessary units
    _(data.spots).filter(s => _.has(s, 'id')).each(s => removeUnmatchedUnit(source.id, s)).value();
    const myCreeps = _(data.spots).map(s => s.id).filter().map(Game.getObjectById).value();

    const freeSpots = _.filter(data.spots, s => !_.has('id'));
    const workNeeded = getMaxWork(source);
    // console.log(`Source ${source.id} needs ${workNeeded} work`);

    _(data.spots)
        .filter(s => undefined === s.id)
        .each(s => s.id = getCreep(source, s, workNeeded, myCreeps))
        .value();
    // _.each(freeSpots, spot => spot.id = );
    console.log(JSON.stringify(data));
    // _.set(Memory, ['sources', source.id], data);
    // request more units

    // harvest
};
