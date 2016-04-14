var imp_constants = require('constants')

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
    return creep.transfer(target, RESOURCE_ENERGY)
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
        return TASK_DONE
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

var actions = 
{
    move0:  makeMoveFunction(0),
    move1:  makeMoveFunction(1),
    move3:  makeMoveFunction(3),
    repair:     repair,
    harvest:    harvest,
    upgrade:    upgrade,
    store_energy:   storeEnergy,
}

var targets =
{
    source:             function(creep) { return creep.getSource() },
    source_site:        function(creep) { return creep.getSource().getSite() },
    source_container:   function(creep) { return creep.getSource().getContainer() },
    source_storage:     function(creep) { return creep.getSource().getStorage() },
    room_controller:    function(creep) { return creep.room.controller }
}

exports.actions = actions
exports.targets = targets
