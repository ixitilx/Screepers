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

exports.Task = Task
exports.TaskFromDoFunc = TaskFromDoFunc
exports.GetTaskById = function(id) { return taskRepo[id]; }
