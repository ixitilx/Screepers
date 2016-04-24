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
        
    if(target.structureType == STRUCTURE_CONTAINER)
    {
        return target.transfer(creep, RESOURCE_ENERGY)
    }
    
    
    function hasFunction(name) { return target[name] && typeof(target[name])=='function' }


    if(hasFunction('transferEnergy'))
        return target.transferEnergy(creep)

    if(hasFunction('transfer'))
        return target.transfer(RESOURCE_ENERGY, creep)

    if(target.amount > 0)
        return creep.pickup(target)
    
    console.log('--------------------------')
    console.log(creep.name, 'can not take energy from', target)
    console.log(target, 'transfer', target['transfer'], typeof(target['transfer']))
    console.log(target, 'transferEnergy', target['transferEnergy'], typeof(target['transferEnergy']), hasFunction('transferEnergy'))
    
    return ERR_INVALID_TARGET
}

function storeEnergy(creep, target)
{
    function hasFunction(name) { return target[name] && typeof(target[name])=='function' }

    if(!target)
        return ERR_INVALID_TARGET

    if(target.x != undefined && target.y != undefined)
    {
        var dx = creep.pos.x - target.x
        var dy = creep.pos.y - target.y
        var dd = (dx*dx)+(dy*dy)
        if(dd <= 2)
            return creep.drop(RESOURCE_ENERGY)
        return ERR_NOT_IN_RANGE
    }

    return creep.transfer(target, RESOURCE_ENERGY)
}

function dropEnergy(creep)
{
    return creep.drop(RESOURCE_ENERGY)
}

var actions = 
{
    move0: makeMoveFunction(0),
    move1: makeMoveFunction(1),
    move3: makeMoveFunction(3),
    
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
