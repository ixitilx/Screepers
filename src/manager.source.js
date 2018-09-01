'use strict';



function buildHarvester(source) {
    const spawn = Game.spawns.Spawn1;
    const body = [WORK, WORK, CARRY, MOVE];
    const name = `harvester_${Game.time % 1500}`;
    const memory = {source: source.id};
    return spawn.spawnCreep(body, name, {memory:memory});
};

function moveTo(creep, pos) {
    const ret = creep.moveTo(pos);
    if (ret === OK || ret === ERR_TIRED || ret === ERR_BUSY)
        return OK;
    return ret;
};

function repair(creep, target) {
    const ret = creep.repair(target);
    if (ret === OK || ret === ERR_TIRED || ret === ERR_BUSY)
        return OK;
    return ret;
};

function transfer(creep, target) {
    const ret = creep.transfer(target);
    if (ret === OK || ret === ERR_BUSY)
        return OK;
    return ret;
};

function harvest(creep, spot, source) {
    const workCount  = _(creep.body).map(b => b.type === WORK ? 1 : 0).sum();
    const hasCarry = _.any(creep.body, {type: CARRY});

    if (workCount === 0 || !hasCarry)
        return ERR_NO_BODYPART;

    if (!creep.pos.isEqualTo(spot))
        return moveTo(creep, spot);

    const creepCarry = _.sum(creep.carry);
    const wouldOverflow = (creep.carryCapacity - creepCarry - workCount * HARVEST_POWER) < 0;
    let repairFlag = false;
    let transferFlag = false;
    if (wouldOverflow) {
        const cont = source.container;
        if (cont instanceof StructureContainer) {
            if (cont.hits < cont.hitsMax/2)
                repairFlag = OK === repair(creep, cont);

            const contUnusedRoom = cont.storeCapacity - _.sum(cont.store);
            if (contUnusedRoom > 0)
                transferFlag = OK === transfer(creep, cont);
        }
    }

    if (creepCarry === creep.carryCapacity && !repairFlag && !transferFlag)
        return ERR_FULL;

    if (!repairFlag)
        return creep.harvest(source);
};

function runHarvester(creep, spot, source) {
    const ret = harvest(creep, spot, source);
    if (ret !== OK)
        console.log(creep, spot, source, ret);
    return ret;
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
