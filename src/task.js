var taskRepo = new Array();

function registerTask(task)
{
	var id = taskRepo.length;
	taskRepo.push(task);
	return id;
}

function Task()
{
    this.Id = registerTask(this);
    this.getById = function(index) { return taskRepo[index]; }

    taskRepo.push(this);
}

function TaskFromDoFunc(doFunc)
{
	var task = new Task();
	task.do = doFunc;
	return task;
}

exports.Task = Task;
exports.TaskFromDoFunc = TaskFromDoFunc;