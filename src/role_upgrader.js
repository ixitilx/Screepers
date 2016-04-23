var imp_constants = require('constants')
var imp_task = require('task')
var imp_table = require('table')

var TASK_DONE = imp_constants.TASK_DONE

function takeEnergy(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    return target.transferEnergy(creep)
}

var actions =
{
    load: takeEnergy,
}

var targets =
{
    controller: function(creep) { return creep.room.controller }
    controller_storage: function(creep) { return creep.room.controller.controller.getBestStorage() }
}

var taskBuilder = new imp_task.TaskBuilder(actions, null)

var load = taskBuilder.makeTask('load', 'controller_storage')
var upgrade = taskBuilder.makeTask('upgradeController', 'controller')
var move_load = taskBuilder.makeTask('move1', 'controller_storage')
var move_upgrade = taskBuilder.makeTask('move3', 'controller')

/*
    1. Load resources
    2. Upgrade
*/

var transitions = [
    [load,    ERR_FULL,                 upgrade],
    [upgrade, ERR_NOT_ENOUGH_RESOURCES, load],
]

var move_transitions = [
    [load, move_load],
    [upgrade, move_upgrade],
]

imp_table.makeTable('upgrader', transitions, move_transitions)
