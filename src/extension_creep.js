require('extension_all').extend('Creep', Creep.prototype)

Creep.prototype.getSource       = function() { return this.getObjectByName('source') }
Creep.prototype.getSpawn        = function() { return this.getObjectByName('spawn') }
Creep.prototype.getExtension    = function() { return this.getObjectByName('extension') }

Creep.prototype.buildBodyArray = function(body)
{
    var bodyArray = new Array()
    for(var partName in body)
        for(var idx = 0; idx < body[partName]; ++idx)
            bodyArray.push(partName)
    return bodyArray
}

Creep.prototype.getBody = function()
{
    var body = new Object()
    this.body.forEach(function(part){
        body[part.type] = body[part.type] ? body[part.type]+1 : 1
    })
    return body
}

Creep.prototype.getBodyCost = function(body)
{
    var cost = new Object()
    for(var partName in body)
        if(this.bodyCost[partName])
            cost[partName] = bodyCost[partName]
    return cost
}

Creep.prototype.getCarry = function()
{
    return _.sum(this.carry)
}

Creep.prototype.loginfo = function()
{
    var role = this.memory.role
    var taskId = this.memory.taskId
    var taskName = imp_task.GetTaskById(taskId).name
    var tableId = this.memory.tableId
    var tableName = imp_table.GetTableById(tableId).name

    console.log('Role [' + role + '], Table [' + tableName + '](' + tableId + '), Task [' + taskName + '](' + taskId + ')');
}

var bodyCost = new Object()
bodyCost[MOVE]          = 50
bodyCost[WORK]          = 100
bodyCost[CARRY]         = 50
bodyCost[ATTACK]        = 80
bodyCost[RANGED_ATTACK] = 150
bodyCost[HEAL]          = 250
bodyCost[CLAIM]         = 600
bodyCost[TOUGH]         = 10

Creep.prototype.bodyCost = bodyCost
