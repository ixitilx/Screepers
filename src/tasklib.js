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

function source_drop_pos(creep)
{
    var source = creep.getSource()
    var pos = source.getDropPos()
    return new RoomPosition(pos.x, pos.y, source.room.name)
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
    source_storage:     function(creep) { return creep.getSource().getBestSpawn().getBestStorage() },
    source_drop_pos:    source_drop_pos,
    source_best_storage:    function(creep) { return creep.getSource().getBestStorage() },
    room_controller:    function(creep) { return creep.room.controller },
}

exports.actions = actions
exports.targets = targets
