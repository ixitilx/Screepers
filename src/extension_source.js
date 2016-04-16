require('extension_all').extend('Source', Source.prototype)
var imp_utils = require('utils')

Source.prototype.getMemory    = function()
{
    if(!Memory.sources)
        Memory.sources = new Object()
    if(!Memory.sources[this.id])
        Memory.sources[this.id] = new Object()
    return Memory.sources[this.id]
}

Source.prototype.getContainer = function() { return this.getObjectByName('container', this.getMemory()) }
Source.prototype.getLink      = function() { return this.getObjectByName('link', this.getMemory()) }
Source.prototype.getSite      = function() { return this.getObjectByName('site', this.getMemory()) }
Source.prototype.getDropPos   = function()
{
    if(!this.getMemory().dropPos)
        this.updatePositions()
    return this.getMemory().dropPos
}

Source.prototype.getBestSpawn = function() { for(spawn in Game.spawns) return Game.spawns[spawn] }
Source.prototype.getWorkRequired = function() {return Math.ceil(this.energyCapacity/600)}

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
    var haulers = imp_utils.creepsByMemory({
        role: 'hauler',
        ferryFromId: this.id,
    })
    if(haulers.length)
        return haulers[0]
}
