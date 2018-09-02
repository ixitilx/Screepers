'use strict';

const {measure} = require('cpu');

function buildHarvester(source) {
    const spawn = Game.spawns.Spawn1;
    const body = [WORK, WORK, CARRY, MOVE];
    const name = `harvester_${Game.time % CREEP_LIFE_TIME}`;
    const memory = {source: source.id};
    return spawn.spawnCreep(body, name, {memory:memory});
};

function harvest(creep, source, spot) {
    const workCount  = _(creep.body).map(b => b.type === WORK ? 1 : 0).sum();
    const hasCarry = _.any(creep.body, {type: CARRY});

    if (workCount === 0 || !hasCarry)
        return ERR_NO_BODYPART;

    const creepCarry = _.sum(creep.carry);
    const wouldOverflow = (creep.carryCapacity - creepCarry - workCount * HARVEST_POWER) < 0;
    let repairFlag = false;
    let transferFlag = false;

    if (wouldOverflow) {
        const cont = source.container;
        if (cont instanceof StructureContainer) {
            if (cont.hits < cont.hitsMax/2)
                repairFlag = OK === creep.helper.repair(cont);

            const contUnusedRoom = cont.storeCapacity - _.sum(cont.store);
            if (contUnusedRoom > 0)
                transferFlag = OK === creep.helper.transfer(cont);
        }
    }

    if (creepCarry === creep.carryCapacity && !repairFlag && !transferFlag)
        return ERR_FULL;

    if (!repairFlag)
        return creep.helper.harvest(source, spot);

    return OK;
};

function haul(creep, source) {
    const cont = source.container;
    if (cont instanceof StructureContainer) {
        const creepCarry = _.sum(creep.carry);
        let repairFlag = false;
        if (cont.hits < cont.hitsMax)
            repairFlag = OK === creep.helper.repair(cont);
        if ((repairFlag || creepCarry < creep.carryCapacity) && cont.store[RESOURCE_ENERGY] > 0)
            creep.helper.withdraw(cont, RESOURCE_ENERGY);
    }

    if (creep.room.storage) {
        return creep.helper.transfer(creep.room.storage);
    }

    return ERR_INVALID_TARGET;
};

function fill(creep) {
    if (creep.room.storage) {
        const ret = creep.helper.withdraw(creep.room.storage);
        if (ret !== ERR_FULL && ret !== ERR_NOT_ENOUGH_RESOURCES)
            return ret;
    }

    const starvingStructures =
        _(Game.structures).filter({room: {name: creep.room.name}})
                          .filter(s => s.energy && s.energyCapacity && s.energy < s.energyCapacity)
                          .value();

    if (_.size(starvingStructures) > 0) {
        return creep.helper.transfer(_.first(starvingStructures));
    }

    return ERR_INVALID_TARGET;
};

function build(creep) {

};

const actions = [harvest, haul, fill, build];

function runHarvester(creep, source, spot) {
    const lastActionId = creep.memory.lastActionId || 0;
    const nActions = _.size(actions);
    for(let i = 0; i < nActions; i++) {
        const idx = (i + lastActionId) % nActions;
        const ret = actions[idx](creep, source, spot);
        if (ret === OK) {
            creep.memory.lastActionId = i + lastActionId;
            return OK;
        } else {
            // console.log(`Creep ${creep} Action ${idx} returned ${ret}. ${source}, ${spot}`);
        }
    }
};

function runHarvesters(source) {
    const harvoSpots = _.zip(source.spots, source.harvesters);
    _(harvoSpots).filter(hs => hs[0] && hs[1])
                 .each(hs => measure('runHarvester', function() {
                    runHarvester(hs[1], source, hs[0]);
                 }).value();
};

function buildHarvesters(source) {
    const harvesters = source.harvesters;
    const spots = source.spots;

    if (_.size(harvesters) < _.size(spots)) {
        buildHarvester(source);
    }
};

function harvestSource(source) {
    // let cpu = Game.cpu.getUsed();
    measure('drawSpots', function() {
        source.drawSpots();
    });
    // let cpu2 = Game.cpu.getUsed();
    // console.log('source.drawSpots', cpu2 - cpu); cpu = cpu2;

    measure('runHarvesters', function() {
        runHarvesters(source);
    });
    // cpu2 = Game.cpu.getUsed();
    // console.log('source.runHarvesters', cpu2 - cpu); cpu = cpu2;

    measure('buildHarvesters', function() {
        buildHarvesters(source);
    });
    // cpu2 = Game.cpu.getUsed();
    // console.log('source.buildHarvesters', cpu2 - cpu); cpu = cpu2;
};

module.exports = harvestSource;
