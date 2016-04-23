require('extension_all').extend('Source', Source.prototype)
var imp_utils = require('utils')

/*
    slots
    harvesters
    spawn

        drop position
        construction site
        container
        link

    hauler
        path
*/

Source.prototype.findSlots = function()
{
    var x = this.pos.x
    var y = this.pos.y

    var t = y - 1
    var l = x - 1
    var b = y + 1
    var r = x + 1

    var slots = [[l,t], [x,t], [r,t],
                 [l,y],        [r,y],
                 [l,b], [x,b], [r,b]]

    function isNotWall(pt)
    {
        return 'wall' != this.room.getPositionAt(pt[0],pt[1]).lookFor('terrain')
    }

    slots = _(slots).filter(isNotWall)
    return slots
}

Source.prototype.extractTickInfo = function(tickCache)
{
    var pos = this.pos
    function isAdjacent(obj) {return imp_utils.distanceSq(pos, obj.pos) <= 2}
    function distance(obj) {return imp_utils.distanceSq(pos, obj.pos)}

    var tick_info = new Object()

    var creeps = tickCache.creeps
    var room_creeps = tickCache.room_creeps[this.room.name]
    var room_sites = tickCache.room_sites[this.room.name]
    var room_structures = tickCache.room_structures[this.room.name]
    var room_resources = tickCache.room_resources[this.room.name]

    // update harvesters
    var myHarvesterFilter = {my:true, memory:{role:'harvester', sourceId: this.id}}
    tick_info.harvesters = _(room_creeps).filter(myHarvesterFilter)

    // update haulers
    var myHaulersFilter = {my:true, memory:{role:'hauler', ferryFromId: this.id}}
    tick_info.haulers = _(creeps).filter(myHaulersFilter)

    // update sites
    var site = _(room_sites).filter({my:true}).filter(isAdjacent).head()

    // update containers
    var contFilter = {structureType:STRUCTURE_CONTAINER}
    tick_info.container = _(room_structures).filter(isAdjacent).filter(contFilter).head()

    // update links
    var linkFilter = {my:true, structureType:STRUCTURE_LINK}
    tick_info.link = _(room_structures).filter(isAdjacent).filter(linkFilter).head()

    // update spawns
    tick_info.spawn = _(room_structures).filter({my:true, structureType:STRUCTURE_SPAWN}).head()

    // update resource piles
    var energyFilter = {resourceType:RESOURCE_ENERGY}
    tick_info.pile = _(room_resources).filter(isAdjacent).filter(energyFilter).sortBy('amount').tail()

    this.getMemory().tick_info = tick_info

    return tick_info
}

Source.prototype.getMemory = function()
{
    if(!Memory.sources)
        Memory.sources = new Object()
    if(!Memory.sources[this.id])
        Memory.sources[this.id] = new Object()
    return Memory.sources[this.id]
}

Source.prototype.getHarvesters  = function() { return this.getMemory().tick_info.harvesters }
Source.prototype.getHaulers     = function() { return this.getMemory().tick_info.haulers }

Source.prototype.getSite        = function() { return this.getMemory().tick_info.site }
Source.prototype.getContainer   = function() { return this.getMemory().tick_info.container }
Source.prototype.getLink        = function() { return this.getMemory().tick_info.link }
Source.prototype.getSpawn       = function() { return this.getMemory().tick_info.spawn }
Source.prototype.getPile        = function() { return this.getMemory().tick_info.pile }

Source.prototype.getStoreEnergyTarget = function()
{
    var store = this.getLink()
    if(!store || store.energy==store.energyCapacity) store = this.getContainer()
    if(!store || store.energy==store.energyCapacity) store = this.getPile()
    if(!store) store = this.getDropPos()
    return store
}

Source.prototype.getTakeEnergyTarget = function()
{
    var take = this.getPile()
    if(!take) take = this.getContainer()
    if(!take || take.energy==take.energyCapacity) take = this.getLink()
    return take
}

Source.prototype.getDropPos = function()
{
    if(!this.getMemory().dropPos)
        this.updatePositions()
    return this.getMemory().dropPos
}

Source.prototype.updatePositions = function()
{
    var storage = this.getBestSpawn().getBestStorage()
    var path = this.pos.findPathTo(storage, {ignoreCreeps: true})
    this.getMemory().dropPos = { x:path[0].x, y:path[0].y }
    this.getMemory().storagePath = Room.serializePath(path)
}

Source.prototype.getWorkRequired = function()
{
    var regenerationCycle = 300
    var harvestPerWork = 2
    var cap = this.energyCapacity

    var workNeed = cap / (regenerationCycle * harvestPerWork)

    return Math.ceil(workNeed)
}
