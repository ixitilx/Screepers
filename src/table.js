var DONE = 100

var tableRepo = new Array()

function Table(defaultTask)
{
    this.AddStateTransition = function(task, status, newTask)
    {
        if(this.transitionTable[task.Id] == undefined)
            this.transitionTable[task.Id] = new Array()
        this.transitionTable[task.Id][status] = newTask
    }

    this.addMoveTransition = function(task, moveTask)
    {
        this.AddStateTransition(task, ERR_NOT_IN_RANGE, moveTask)
        this.AddStateTransition(moveTask, DONE, task)
        
        this.AddStateTransition(moveTask, OK, moveTask)
        this.AddStateTransition(moveTask, ERR_TIRED, moveTask)
        this.AddStateTransition(moveTask, ERR_NO_PATH, moveTask)
    }

    this.Lookup = function(task, status)
    {
        if(this.transitionTable[task.Id] == undefined)
        {
            console.log("Task is not registered in this table. Use table.AddStateTransition(task, status, newTask) to register.")
            return undefined
        }
        if(this.transitionTable[task.Id][status] == undefined)
        {
            console.log("Task [" + task.Name + "] does not have transition from [" + status + "] status.")
            return undefined
        }
        return this.transitionTable[task.Id][status]
    }

    this.Id = tableRepo.length
    this.transitionTable = new Array()
    this.transitionTable[-1] = defaultTask
    this.AddStateTransition(defaultTask, ERR_BUSY, defaultTask)

    tableRepo.push(this)
}

exports.Table = Table
exports.GetTableById = function(id) { return tableRepo[id]; }
