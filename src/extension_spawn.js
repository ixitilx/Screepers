require('extension_all').extend('Spawn', Spawn.prototype)

var imp_utils = require('utils')
/*
    extensions
    manager = hauler

    container
    link

    storage - accessible from room
    terminal - accessible from room
*/

Spawn.prototype.extractTickInfo = function(tickCache)
{
    var pos = this.pos
    //function distanceSq(obj) {return imp_utils.distanceSq(pos, obj.pos)}
    function inRange2(obj) {return imp_utils.distanceSq(pos, obj.pos) < 3*3}

    var room_creeps = tickCache.room_creeps[this.room.name]
    var room_structures = tickCache.room_structures[this.room.name]
    var room_resources = tickCache.room_resources[this.room.name]

    var dropPos = this.getDropPos()
    function dropDistance(pile) { return imp_utils.distanceSq(pile.pos, dropPos) }

    var tick_info =
    {
        extensions: _(room_structures).filter({my:true, structureType:STRUCTURE_EXTENSION}),
        containers: _(room_structures).filter(inRange2).filter({structureType:STRUCTURE_CONTAINER}),
        links:      _(room_structures).filter(inRange2).filter({my:true, structureType:STRUCTURE_LINK}),
        manager:    _(room_creeps).filter({my:true, memory:{role:'hauler', ferryFromId:this.id, ferryToId:this.id}}).head(),
        haulers:    _(room_creeps).filter({my:true, memory:{role:'hauler', ferryToId:this.id}}).reject({memory:{ferryFromId:this.id}}),
        piles:      _(room_resources).filter(inRange2).sortBy(dropDistance),
    }

    this.memory.tick_info = tick_info
    return tick_info
}

Spawn.prototype.getExtensions = function() { return this.memory.tick_info.extensions }
Spawn.prototype.getManager    = function() { return this.memory.tick_info.manager }
Spawn.prototype.getHaulers    = function() { return this.memory.tick_info.haulers }
Spawn.prototype.getContainer  = function() { return this.memory.tick_info.containers.head() }
Spawn.prototype.getLink       = function() { return this.memory.tick_info.links.head() }
Spawn.prototype.getPile       = function() { return this.memory.tick_info.piles.last() }
Spawn.prototype.getStorage    = function() { return this.room.storage }
Spawn.prototype.getTerminal   = function() { return this.room.terminal }

Spawn.prototype.getStoreEnergyTarget = function()
{
    var pos = this.pos

    function full(ext) { return ext.energy == ext.energyCapacity }
    function distanceSq(ext) { return imp_utils.distanceSq(pos, ext.pos)}

    var extension = this.getExtensions().reject(full).sortBy(distanceSq).head()
    if(extension)
        return extension

    if(this.energy < this.energyCapacity)
        return this

    var storage = this.getStorage()
    if(storage)
        return storage

    var container = this.getContainer()
    if(container)
        return container

    return this.getDropPos()
}

Spawn.prototype.getTakeEnergyTarget = function()
{
    var pile = this.getPile()
    if(pile)
        return pile

    var terminal = this.getTerminal()
    if(terminal && terminal.store[RESOURCE_ENERGY])
        return terminal

    var link = this.getLink()
    if(link && link.energy)
        return link

    var container = this.getContainer()
    if(container && container.store[RESOURCE_ENERGY])
        return container

    var storage = this.getStorage()
    if(storage && storage.store[RESOURCE_ENERGY])
        return storage
}

Spawn.prototype.getTotalEnergy = function()
{
    return this.energy + this.getExtensions().map('energy').sum()
}

Spawn.prototype.getTotalEnergyCapacity = function()
{
    var cap = this.energyCapacity
    if(this.getManager() || this.getHaulers().size())
        cap += this.getExtensions().map('energyCapacity').sum()
    return Math.max(cap, this.getTotalEnergy())
}

Spawn.prototype.getDropPos = function()
{
    if(!this.memory.dropPos)
        this.memory.dropPos = this.findDropPos()
    return new RoomPosition(this.memory.dropPos.x, this.memory.dropPos.y, this.room.name)
}

Spawn.prototype.findDropPos = function()
{
    for(var idx=0; idx<100; ++idx)
    {
        var x = this.pos.x + Math.floor(Math.random()*2) - 1
        var y = this.pos.y + Math.floor(Math.random()*2) - 1
        if(x == this.pos.x && y == this.pos.y)
            continue
        
        var objects = _(this.room.lookAt(x, y))
        var structs = objects.filter({type:'structure'})
        var terrain = objects.filter({type:'terrain'}).head()
        if(structs.size() == 0 && terrain.terrain!='wall')
            return {x:x, y:y}
    }
}
