require('extension_all').extend('Source', Source.prototype)
var imp_utils = require('utils')

Source.prototype.getContainer = function() { return this.getObjectByName('container') }
Source.prototype.getLink      = function() { return this.getObjectByName('link') }
Source.prototype.getSite      = function() { return this.getObjectByName('site') }
Source.prototype.getDropPos   = function()
{
    if(!this.memory.dropPos)
        this.updatePositions()
    return this.memory.dropPos
}

Source.prototype.getBestSpawn = function() { for(spawn in Game.spawns) return Game.spawns[spawn] }
Source.prototype.getWorkRequired = function() {return Math.ceil(this.energyCapacity/600)}

Source.prototype.updatePositions = function()
{
    var storage = this.getBestSpawn().getBestStorage()
    var path = source.pos.findPathTo(storage, {ignoreCreeps: true})
    this.memory.dropPos = { x:path[0].x, y:path[0].y }
    this.memory.storagePath = Room.serializePath(path)
}

Source.prototype.getBestStorage = function()
{
    var storage = this.getLink()
    if(!storage)
        storage = this.getContainer()
    return storage
}

Source.prototype.getHarvesters = function()
{
    return imp_utils.creepsByMemory({
        role    : 'harvester',
        sourceId: this.id
    })
}

Source.prototype.getHauler = function()
{
    return imp_utils.creepsByMemory({
        role: 'hauler',
        ferryFrom: this.id,
    })
}
