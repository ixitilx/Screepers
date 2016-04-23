var imp_constants = require('constants')

var TASK_DONE = imp_constants.TASK_DONE


function makeMoveFunction(range)
{
    var moveFunction = function(creep, target)
    {
        if(creep.pos.getRangeTo(target) <= range)
            return TASK_DONE
        return creep.moveTo(target)
    }
    return moveFunction
}

function storeEnergy(creep, target)
{
    // if(target.energy == target.energyCapacity)
    //     return ERR_FULL
    return creep.transfer(target, RESOURCE_ENERGY)
}

function dropEnergy(creep)
{
    return creep.drop(RESOURCE_ENERGY)
}

function harvest(creep, target)
{
    if(creep.getCarry() >= creep.carryCapacity)
        return TASK_DONE
    return creep.harvest(target)
}

function repair(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    var missingHits = target.hitsMax - target.hits
    var repairHits = creep.getBody()[WORK] * 100
    if(repairHits > missingHits)
        return TASK_DONE
    return creep.repair(target)
}

function upgrade(creep, target)
{
    return creep.upgradeController(target)
}

function buildSafe(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    var work = creep.getBody()[WORK]
    var maxBuildEnergy = work * 5
    if(creep.carry.energy < maxBuildEnergy)
        return ERR_NOT_ENOUGH_RESOURCES
    return creep.build(target)
}

function takeEnergy(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    return target.transferEnergy(creep)
    // var freeRoom = creep.carryCapacity - creep.getCarry()
    // return target.transferEnergy(creep, freeRoom)
}

var actions = 
{
    move0:  makeMoveFunction(0),
    move1:  makeMoveFunction(1),
    move3:  makeMoveFunction(3),
    
    build_safe: buildSafe,
    
    repair: repair,
    harvest: harvest,
    upgrade: upgrade,
    
    take_energy: takeEnergy,
    store_energy: storeEnergy,
    drop_energy: dropEnergy,
}

var targets = {}

exports.actions = actions
exports.targets = targets
