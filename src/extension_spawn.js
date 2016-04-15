Spawn.prototype.getInfo = function() { return Memory.spawns[this.id] }

Spawn.prototype.getExtensions = function()
{
    
}

Spawn.prototype.getContainer = function()
{
    return Game.getObjectById(this.getInfo().containerId)
}

Spawn.prototype.getStorage = function()
{
    return Game.getObjectById(this.getInfo().storageId)
}
