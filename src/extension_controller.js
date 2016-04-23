require('extension_all').extend('Controller', Controller.prototype)
var imp_utils = require('utils')

Controller.prototype.getMemory = function()
{
    if(!Memory.controllers)
        Memory.controllers = new Object()
    if(!Memory.controllers[this.id])
        Memory.controllers[this.id] = new Object
    return Memory.controllers[this.id]
}

Controller.prototype.getExtensionCapacity = function()
{
    switch(this.level)
    {
        case 7: return 100
        case 8: return 200
        default: return 50
    }
}

Source.prototype.getDropPos = function()
{
    if(!this.getMemory().dropPos)
        this.updatePositions()
    return this.getMemory().dropPos
}

Source.prototype.getBestSpawn = function()
{
    for(spawn in Game.spawns)
        return Game.spawns[spawn]
}

Source.prototype.updatePositions = function()
{
    var storage = this.getBestSpawn().getBestStorage()
    var path = this.pos.findPathTo(storage, {ignoreCreeps: true})
    this.getMemory().dropPos = { x:path[0].x, y:path[0].y }
    this.getMemory().storagePath = Room.serializePath(path)
}

Source.prototype.getBestStorage = function()
{
    var storage = this.getLink()
    if(!storage)
        storage = this.getContainer()
    if(!storage)
    {
        var res = this.pos.findInRange(FIND_DROPPED_RESOURCES, 1)
        if(res && res.length)
            storage = res[0]
    }
    return storage
}

Source.prototype.getUpgraders = function()
{
    return imp_utils.creepsByMemory({
        role    : 'upgrader',
        controllerId: this.id
    })
}

Source.prototype.getHauler = function()
{
    var haulers = imp_utils.creepsByMemory({
        role: 'hauler',
        ferryFromTo: this.id,
    })
    if(haulers.length)
        return haulers[0]
}
