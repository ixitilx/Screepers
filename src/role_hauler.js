var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

function takeEnergy(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    return target.transfer(creep, RESOURCE_ENERGY)
}

function ferryFrom(creep)
{
    var obj = creep.getObjectByName('ferryFrom')
    if(obj && obj['getBestStorage'])
        obj = obj.getBestStorage()
    return obj
}

function ferryTo(creep)
{
    var obj = creep.getObjectByName('ferryTo')
    if(obj && obj['getBestStorage'])
        return obj.getBestStorage()
    return obj
}

var actions =
{
    take_energy: takeEnergy,
}

var targets =
{
    ferry_from: ferryFrom,
    ferry_to:   ferryTo,
}


var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var load = taskBuilder.makeTask('take_energy', 'ferry_from')
var pickup = taskBuilder.makeTask('pickup', 'ferry_from')
var unload = taskBuilder.makeTask('store_energy', 'ferry_to')

var move_load = taskBuilder.makeTask('move1', 'ferry_from')
var move_pickup = taskBuilder.makeTask('move1', 'ferry_from')
var move_unload = taskBuilder.makeTask('move1', 'ferry_to')

var transitions = [
    [pickup, OK, load],
    [pickup, ERR_INVALID_TARGET, load],
    [pickup, ERR_FULL, unload],
    [load,   ERR_FULL, unload],
    [unload, ERR_NOT_ENOUGH_RESOURCES, pickup],
]

var move_transitions = [
    [pickup, move_pickup],
    [load,   move_load],
    [unload, move_unload]
]

imp_table.makeTable('hauler', transitions, move_transitions)
