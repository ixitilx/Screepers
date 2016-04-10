var taskRepo = new Array();

function registerTask(task)
{
	var id = taskRepo.length;
	taskRepo.push(task);
	return id;
}

function Task(name)
{
    this.Id = registerTask(this);
    this.Name = name;

    taskRepo.push(this);
}

function TaskFromDoFunc(name, doFunc)
{
	var task = new Task(name);
	task.do = doFunc;
	return task;
}

exports.Task = Task;
exports.TaskFromDoFunc = TaskFromDoFunc;
exports.GetTaskById = function(id) { return taskRepo[id]; }
