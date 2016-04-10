var tableRepo = new Array();

function Table(defaultTask)
{
    this.Id = tableRepo.length;
    this.transitionTable = new Array();
    this.transitionTable[-1] = defaultTask;

    this.AddStateTransition = function(task, status, newTask)
    {
        if(this.transitionTable[task.Id] == undefined)
            this.transitionTable[task.Id] = new Array();
        this.transitionTable[task.Id][status] = newTask
    }

    this.Lookup = function(task, status)
    {
        if(this.transitionTable[task.Id] == undefined)
        {
            console.log("Task is not registered in this table. Use table.AddStateTransition(task, status, newTask) to register.");
            return undefined;
        }
        if(this.transitionTable[task.Id][status] == undefined)
        {
            console.log("Task [" + task.Name + "] does not have transition from [" + status + "] status.");
            return undefined;
        }
        return this.transitionTable[task.Id][status];
    }

    tableRepo.push(this);
}

exports.Table = Table;
exports.GetTableById = function(id) { return tableRepo[id]; }
