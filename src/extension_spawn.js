require('extension_all').extend('Spawn', Spawn.prototype)

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

Spawn.prototype.getExtensions = function()
{
    return this.getExtensionIds().map(getCachedObjectById)
}

Spawn.prototype.getTotalEnergy = function()
{
    function getEnergy(ext) { return ext.energy }
    return this.energy + _.sum(this.getExtensions().map(getEnergy))
}

Spawn.prototype.getTotalEnergyCapacity = function()
{
    function getCapacity(ext) { return ext.energyCapacity }
    var capacity = this.energyCapacity
    if(this.getManager())
        capacity += _.sum(this.getExtensions().map(getCapacity))
    return Math.max(capacity, this.getTotalEnergy())
}
