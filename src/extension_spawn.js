require('extension_all').extend('Spawn', Spawn.prototype)

var imp_utils = require('utils')

Spawn.prototype.getContainer = function() { return this.getObjectByName('container') }
Spawn.prototype.getLink      = function() { return this.getObjectByName('link') }
Spawn.prototype.getStorage   = function() { return this.getObjectByName('storage') }
Spawn.prototype.getTerminal  = function() { return this.getObjectByName('terminal') }

Spawn.prototype.getManager = function()
{
    var managers = imp_utils.creepsByMemory({
        role: 'spawn_manager',
        spawnId: this.id,
    })
    if(managers.length)
        return managers[0]
}


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
    return this.getExtensionIds().map(this.getCachedObjectById)
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
    // console.log(capacity)
    return Math.max(capacity, this.getTotalEnergy())
}
