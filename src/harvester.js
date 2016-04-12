var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')
var imp_tasklib   = require('tasklib')

var TASK_DONE = imp_constants.TASK_DONE

function getWorkRequired(source)
{
    return Math.ceil(source.energyCapacity/600)
}

function warnAboutSpawns(room)
{
    var spawnCount = room.find(FIND_MY_STRUCTURES, {filter: function(s) { s.structureType == STRUCTURE_SPAWN }}).length
    if(spawnCount > 1)
        console.log('MORE THAN ONE SPAWNS FOUND! Check if they contribute towards room energy capacity')
}

function buildBody(work, carry, move)
{
    var body = new Array()
    for(var idx = 0; idx < work; ++idx)     body.push(WORK)
    for(var idx = 0; idx < carry; ++idx)    body.push(CARRY)
    for(var idx = 0; idx < move; ++idx)     body.push(MOVE)
    return body
}

function getBody(spawn, source)
{
    var room = spawn.room
    warnAboutSpawns(room)
    var maxEnergy = room.energyCapacityAvailable
    var carry = 1
    var move = 1
    var work = Math.min(getWorkRequired(source), (maxEnergy - 50*(carry+move))/100)
    return buildBody(work, carry, move)
}

function getSourceInfo(creep) { return Memory.strategies.harvesting.sources[creep.memory.sourceId] }
function getSource(creep)     { return Game.getObjectById(creep.memory.sourceId)}
function getContainer(creep)  { return Game.getObjectById(getSourceInfo(creep).containerId) }
function getSite(creep)       { return Game.getObjectById(getSourceInfo(creep).siteId) }
function getStorage(creep)    { return Game.getObjectById(getSourceInfo(creep).storageId) }

var targets =
{
    source:     getSource,
    site:       getSite,
    container:  getContainer,
    storage:    getStorage
}

function move(range) 
{
    var moveFunction = function(creep, target)
    {
        return creep.pos.getRangeTo(target) <= range ? TASK_DONE : creep.moveTo(target)
    }
    
    return moveFunction
}

function storeEnergy(creep, target) { return creep.transfer(target, RESOURCE_ENERGY) }
function harvestEnergy(creep, target) { return _.sum(creep.carry) >= creep.carryCapacity ? TASK_DONE : creep.harvest(target) }

var actions =
{
    move0: move(0),
    move1: move(1),
    move3: move(3),
    store: storeEnergy,
    harvest: harvestEnergy,
}

function getAction(actionName)
{
    if(actions[actionName])
        return actions[actionName]

    var defaultAction = function(creep, target) { return creep[actionName](target) }
    return defaultAction
}

function makeTask(actionName, targetName)
{
    var target = targets[targetName]
    var action = getAction(actionName)
    var taskName = actionName + '.' + targetName

    function loop(creep)
    {
        return action(creep, target(creep))
    }
    return imp_task.TaskFromDoFunc(taskName, loop)
}

function makeTable(name, transitions, move_transitions)
{
    var table = new imp_table.Table(name, transitions[0][0])

    function addTransition(t) { return table.AddStateTransition(t[0], t[1], t[2]) }
    function addMoveTransition(t)
    {
        addTransition([t[0], ERR_NOT_IN_RANGE, t[1]])
        addTransition([t[1], TASK_DONE,        t[0]])
    }

    transitions.forEach(addTransition)
    move_transitions.forEach(addMoveTransition)

    return table
}

function createHarvesterTable()
{
    var harvest      = makeTask('harvest', 'source')
    var build        = makeTask('build', 'site')
    var store        = makeTask('store', 'container')
    var haul         = makeTask('store', 'storage')
    var move_harvest = makeTask('move1', 'source')
    var move_build   = makeTask('move3', 'site')
    var move_store   = makeTask('move0', 'container')
    var move_haul    = makeTask('move1', 'storage')

    var transitions = [
        [harvest, OK,        store],
        [harvest, ERR_NOT_ENOUGH_RESOURCES, move_harvest],
        [harvest, TASK_DONE, build],

        [store, ERR_NOT_ENOUGH_RESOURCES, harvest],
        [store, ERR_INVALID_TARGET,       harvest],
        [store, ERR_FULL,                 haul],

        [build, ERR_NOT_ENOUGH_RESOURCES, harvest],
        [build, ERR_INVALID_TARGET,       haul],

        [haul, ERR_NOT_ENOUGH_RESOURCES, harvest]
    ]

    var move_transitions = [
        [harvest, move_harvest],
        [store, move_store],
        [build, move_build],
        [haul, move_haul]
    ]

    return makeTable('harvester_table', transitions, move_transitions)
}

var harvesterTable = createHarvesterTable()

exports.spawn = function(spawn, source)
{
    var mem = new Object()
    mem.role = 'harvester'

    mem.taskId = imp_tasklib.HarvestEnergyTask.id
    mem.tableId = harvesterTable.id
    mem.sourceId = source.id

    return spawn.createCreep(getBody(spawn, source), null, mem)
}

exports.getBody = getBody
exports.getWorkRequired = getWorkRequired
