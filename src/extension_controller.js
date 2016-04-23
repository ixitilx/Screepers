require('extension_all').extend('Structure', Structure.prototype)
var imp_utils = require('utils')


/*
    controller
    storage
        energy pile
        container
        link
*/

var proto = new Object

proto.getMemory = function()
{
    if(!Memory.controllers)
        Memory.controllers = new Object()
    if(!Memory.controllers[this.id])
        Memory.controllers[this.id] = new Object
    return Memory.controllers[this.id]
}

proto.getExtensionCapacity = function()
{
    switch(this.level)
    {
        case 7: return 100
        case 8: return 200
        default: return 50
    }
}

proto.getDropPos = function()
{
    if(!this.getMemory().dropPos)
        this.updatePositions()
    return this.getMemory().dropPos
}

proto.getBestSpawn = function()
{
    for(spawn in Game.spawns)
        return Game.spawns[spawn]
}

proto.updatePositions = function()
{
    var storage = this.getBestSpawn().getBestStorage()
    var path = this.pos.findPathTo(storage, {ignoreCreeps: true})
    this.getMemory().dropPos = { x:path[0].x, y:path[0].y }
    this.getMemory().storagePath = Room.serializePath(path)
}

proto.getBestStorage = function()
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

proto.getUpgrader = function()
{
    var upgraders = imp_utils.creepsByMemory({
        role    : 'upgrader',
        controllerId: this.id
    })
    if(upgraders.length)
        return upgraders[0]
}

proto.getHauler = function()
{
    var haulers = imp_utils.creepsByMemory({
        role: 'hauler',
        ferryFromTo: this.id,
    })
    if(haulers.length)
        return haulers[0]
}

Structure.prototype.controller = proto
