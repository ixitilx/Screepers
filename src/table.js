var imp_constants = require('constants')
var imp_task = require('task')

var TASK_DONE = imp_constants.TASK_DONE

var tableRepo = new Object()

function getTable(role)
{
    return tableRepo[role]
}

function Table(role, transitions, move_transitions)
{
    this.addStateTransition = function(task, status, newTask)
    {
        if(!this.defaultTask)
        {
            this.defaultTask = task
            this.addStateTransition(task, ERR_BUSY, task)
        }
        
        if(this.transitionTable[task.id] == undefined)
            this.transitionTable[task.id] = new Object()
        this.transitionTable[task.id][status] = newTask
    }

    this.lookup = function(task, status)
    {
        if(!task)
        {
            console.log("Invalid input: can not transition from [undefined] task. Reverting to default task.")
            return this.defaultTask
        }

        if(!this.transitionTable[task.id])
        {
            console.log("Task [" + task.name + "] is not registered in table [" + this.name + "]. Reverting to default task.")
            return this.defaultTask
        }

        return this.transitionTable[task.id][status]
    }

    this.role = role
    this.name = role
    this.transitionTable = new Object()
    tableRepo[role]=this
}

function makeTable(role, transitions, move_transitions)
{
    var table = new Table(role)

    function addTransition(t)
    {
        return table.addStateTransition(t[0], t[1], t[2])
    }

    function addMoveTransition(t)
    {
        addTransition([t[0], ERR_NOT_IN_RANGE, t[1]])
        addTransition([t[1], TASK_DONE,        t[0]])
    }

    transitions.forEach(addTransition)
    move_transitions.forEach(addMoveTransition)

    return table
}

exports.Table = Table
exports.makeTable = makeTable
exports.getTable = getTable
