var imp_constants = require('constants')

var TASK_DONE = imp_constants.TASK_DONE

var taskRepo = new Array()

function registerTask(task)
{
    task.id = taskRepo.length
    taskRepo.push(task)
}

function Task(name)
{
    this.name = name
    registerTask(this)
}

function taskFromDoFunc(name, doFunc)
{
    var task = new Task(name)
    task.do = doFunc
    return task
}

function TaskBuilder(actions, targets)
{
    this.targets = targets
    this.actions = actions
    
    this.getAction = function(actionName)
    {
        if(this.actions[actionName])
            return this.actions[actionName]

        var defaultAction = function(creep, target) { return creep[actionName](target) }
        return defaultAction
    }

    this.makeTask = function(actionName, targetName)
    {
        var target = this.targets[targetName]
        // console.log(targetName, typeof target, target)
        var action = this.getAction(actionName)
        var taskName = actionName + '.' + targetName

        function loop(creep)
        {
            return action(creep, target(creep))
        }
        return taskFromDoFunc(taskName, loop)
    }
}

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

exports.Task = Task
exports.taskFromDoFunc = taskFromDoFunc
exports.getTaskById = function(id) { return taskRepo[id] }
exports.TaskBuilder = TaskBuilder
exports.makeMoveFunction = makeMoveFunction
