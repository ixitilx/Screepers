var imp_constants = require('constants')
var imp_task      = require('task')
var imp_table     = require('table')

var TASK_DONE = imp_constants.TASK_DONE

/*
    Obsolete, to be replaced with hauler
*/

function takeEnergy(creep, target)
{
    if(!target)
        return ERR_INVALID_TARGET
    return target.transferEnergy(creep)
}

var actions =
{
    take_energy: takeEnergy,
}

var targets =
{
    spawn_nrg_get: function(creep) { return creep.getSpawn().getTakeEnergyTarget() },
    spawn_nrg_put: function(creep) { return creep.getSpawn().getStoreEnergyTarget() },
}


var taskBuilder = new imp_task.TaskBuilder(actions, targets)

var load   = taskBuilder.makeTask('take_energy',  'spawn_nrg_get')
var unload = taskBuilder.makeTask('store_energy', 'spawn_nrg_put')

var move_load   = taskBuilder.makeTask('move1', 'spawn_nrg_get')
var move_unload = taskBuilder.makeTask('move1', 'spawn_nrg_put')

var transitions = [
    [load, ERR_FULL, unload],
    [unload, ERR_NOT_ENOUGH_RESOURCES, load],
]

var move_transitions = [
    [load,   move_load],
    [unload, move_unload],
]

imp_table.makeTable('spawn_manager', transitions, move_transitions)
