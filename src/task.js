var imp_constants = require('constants')
var imp_tasklib = require('tasklib')

var TASK_DONE = imp_constants.TASK_DONE

var taskRepo = new Array()

function Task(name)
{
    this.name = name
    this.id = taskRepo.length
    taskRepo.push(this)
}

function taskFromDoFunc(name, doFunc)
{
    var task = new Task(name)
    task.do = doFunc
    return task
}

function formatName(str)
{
    return str
    return str.replace(/[eyuioa]/gi, '').slice(0, 4)
}

function TaskBuilder(actions, targets)
{
    this.targets = targets
    this.actions = actions
    
    this.getAction = function(actionName)
    {
        if(this.actions && this.actions[actionName])
            return this.actions[actionName]

        if(imp_tasklib.actions[actionName])
            return imp_tasklib.actions[actionName]

        var defaultAction = function(creep, target) { return creep[actionName](target) }
        return defaultAction
    }

    this.getTarget = function(targetName)
    {
        if(this.targets && this.targets[targetName])
            return this.targets[targetName]

        return imp_tasklib.targets[targetName]
    }

    this.makeTask = function(actionName)
    {
        return this.makeTask(actionName, null)
    }

    this.makeTask = function(actionName, targetName)
    {
        var target = this.getTarget(targetName)
        var action = this.getAction(actionName)
        var taskName = formatName(actionName) + '.' + formatName(targetName)

        function loop(creep)
        {
            return action(creep, target(creep))
        }

        function loop_notarget(creep)
        {
            return action(creep)
        }

        return taskFromDoFunc(taskName, target ? loop : loop_notarget)
    }
}

exports.Task = Task
exports.taskFromDoFunc = taskFromDoFunc
exports.getTaskById = function(id) { return taskRepo[id] }
exports.TaskBuilder = TaskBuilder
