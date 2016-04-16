require('extension_all').extend(Source.prototype)

Spawn.prototype.getContainer = function() { return this.getObjectByName('container') }
Spawn.prototype.getLink      = function() { return this.getObjectByName('link') }
Spawn.prototype.getStorage   = function() { return this.getObjectByName('storage') }
Spawn.prototype.getTerminal  = function() { return this.getObjectByName('terminal') }
Spawn.prototype.getManager   = function() { return this.getObjectByName('manager') }

Spawn.prototype.getBestStorage = function()
{
    var storage = this.getStorage()
    if(!storage)
        storage = this.getContainer()
    if(!storage)
        storage = this
    return storage
}

Spawn.prototype.getExtensionIds = function()
{
    if(!this.memory.extensionIds)
        this.memory.extensionIds = new Array()
    return this.memory.extensionIds
}

Spawn.prototype.getTotalEnergy = function()
{
    var energy = this.energy
    var extIds = this.getExtensionIds()
    if(extIds)
    {
        var exts = extIds.map(function(id){return this.getCachedObjectById(id)})
        var extEnergy = exts.map(function(ext){return ext ? ext.energy : 0})
        energy += _.sum(extEnergy)
    }
    return energy
}

Spawn.prototype.getTotalEnergyCapacity = function()
{
    var capacity = this.energyCapacity
    if(this.getManager())
    {
        var extIds = this.getExtensionIds()
        if(extIds)
            capacity += this.room.controller.getExtensionCapacity() * extIds.length
    }
    return Math.max(capacity, this.getTotalEnergy())
}
