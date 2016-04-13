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

function TaskFromDoFunc(name, doFunc)
{
    var task = new Task(name)
    task.do = doFunc
    return task
}

function TaskBuilder(targets, actions)
{
    function getAction(actionName)
    {
        if(actions[actionName])
            return actions[actionName]

        var defaultAction = function(creep, target) { return creep[actionName](target) }
        return defaultAction
    }

    this.makeTask = function(actionName, targetName)
    {
        var target = targets[targetName]
        var action = getAction(actionName)
        var taskName = actionName + '.' + targetName

        function loop(creep)
        {
            return action(creep, target(creep))
        }
        return TaskFromDoFunc(taskName, loop)
    }
}

exports.Task = Task
exports.TaskFromDoFunc = TaskFromDoFunc
exports.GetTaskById = function(id) { return taskRepo[id]; }
exports.TaskBuilder = TaskBuilder