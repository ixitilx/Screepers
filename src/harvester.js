var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

function storeEnergy(creep, target)
{
    return creep.transfer(target, RESOURCE_ENERGY)
}

function harvestEnergy(creep, target)
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
    var repairHits = creep.getBody() * Creep.prototype.bodyCost[WORK]
    if(repairHits > missingHits)
        return TASK_DONE
    return creep.repair(target)
}

var actions =
{
    move0:      imp_task.makeMoveFunction(0),
    move1:      imp_task.makeMoveFunction(1),
    move3:      imp_task.makeMoveFunction(3),
    store:      storeEnergy,
    repair:     repair,
    harvest:    harvestEnergy,
}

var targets =
{
    source:     function(creep) { return creep.getSource() },
    site:       function(creep) { return creep.getSource().getSite() },
    container:  function(creep) { return creep.getSource().getContainer() },
    storage:    function(creep) { return creep.getSource().getStorage() },
}

var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var harvest      = taskBuilder.makeTask('harvest', 'source')
var build        = taskBuilder.makeTask('build', 'site')
var store        = taskBuilder.makeTask('store', 'container')
var haul         = taskBuilder.makeTask('store', 'storage')
var repair       = taskBuilder.makeTask('repair', 'container')
var move_harvest = taskBuilder.makeTask('move1', 'source')
var move_build   = taskBuilder.makeTask('move3', 'site')
var move_store   = taskBuilder.makeTask('move0', 'container')
var move_haul    = taskBuilder.makeTask('move1', 'storage')

var transitions = [
    [harvest, OK,                 repair ],
    [repair,  OK,                 harvest],
    [repair,  TASK_DONE,          store  ],
    [store,   OK,                 harvest],

    [store,   ERR_FULL,           harvest],
    [store,   ERR_INVALID_TARGET, build  ],
    [repair,  ERR_INVALID_TARGET, build  ],
    [build,   ERR_INVALID_TARGET, harvest],

    [harvest, TASK_DONE, haul],

    [store,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [build,  ERR_NOT_ENOUGH_RESOURCES, harvest],
    [repair, ERR_NOT_ENOUGH_RESOURCES, harvest],
    [haul,   ERR_NOT_ENOUGH_RESOURCES, harvest],
    
    [harvest, ERR_NOT_ENOUGH_RESOURCES, move_harvest],
]

var move_transitions = [
    [harvest, move_harvest],
    [store, move_store],
    [build, move_build],
    [haul, move_haul]
]

imp_table.makeTable('harvester', transitions, move_transitions)


function warnAboutSpawns(room)
{
    var spawnCount = room.find(FIND_MY_STRUCTURES, {filter: function(s) { s.structureType == STRUCTURE_SPAWN }}).length
    if(spawnCount > 1)
        console.log('MORE THAN ONE SPAWNS FOUND! Check if they contribute towards room energy capacity')
}

function buildBestHarvesterBody(source)
{
    var room = source.room
    warnAboutSpawns(room)

    var maxEnergy = room.energyCapacityAvailable
    var bodyCost = Creep.prototype.bodyCost

    var body = new Object()
    var workReq = source.getWorkRequired()
    var workEnergy = maxEnergy - (bodyCost[CARRY] + bodyCost[MOVE])
    body[WORK] = Math.min(workReq, Math.floor(workEnergy/bodyCost[WORK]))
    body[CARRY] = 1
    body[MOVE] = 1

    return Creep.prototype.buildBodyArray(body)
}

exports.spawn = function(spawn, source)
{
    var mem = new Object()
    mem.role = 'harvester'
    mem.sourceId = source.id
    return spawn.createCreep(buildBestHarvesterBody(source), null, mem)
}
