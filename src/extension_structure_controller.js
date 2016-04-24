var imp_utils = require('utils')
/*
    controller
    
    storage
        energy pile
        container
        link
    upgrader
    hauler
*/

function Controller
{
    this.getMemory = function()
    {
        if(!Memory.structures)
            memory.structures = new Object()
        if(!Memory.structures[this.structureType])
            memory.structures[this.structureType] = new Object
        if(!Memory.structures[this.structureType][this.id])
            Memory.structures[this.structureType][this.id] = new Object
        return Memory.structures[this.structureType][this.id]
    }

    this.extractTickInfo = function(tickCache)
    {
        var pos = this.pos
        var dropPos = this.getDropPos()
        
        function adjacent(obj) {return imp_utils.distanceSq(pos, obj.pos) <= 1+1}
        function inRange3(obj) {return imp_utils.distanceSq(pos, obj.pos) <= 3+3}
        function dropDistance(pile) { return imp_utils.distanceSq(pile.pos, dropPos) }

        var room_creeps = tickCache.room_creeps[this.room.name]
        var room_structures = tickCache.room_structures[this.room.name]
        var room_resources = tickCache.room_resources[this.room.name]

        var tick_info =
        {
            spawn:      _(room_structures).filter({my:true, structureType:STRUCTURE_SPAWN}).head(),

            containers: _(room_structures).filter(adjacent).filter({structureType:STRUCTURE_CONTAINER}),
            links:      _(room_structures).filter(adjacent).filter({my:true, structureType:STRUCTURE_LINK}),
            piles:      _(room_resources) .filter(adjacent).sortBy(dropDistance),

            sites:      _(room_sites)     .filter(adjacent).filter({my:true}),

            haulers:    _(room_creeps)    .filter({my:true, memory:{role:'hauler', ferryToId:this.id}}),
            upgraders:  _(room_creeps)    .filter({my:true, memory:{role:'upgrader'}}),
        }

        this.getMemory.tick_info = tick_info
        return tick_info
    }

    this.getSpawn     = function() { return this.getMemory().tick_info.spawn }
    this.getContainer = function() { return this.getMemory().tick_info.containers.head() }
    this.getLink      = function() { return this.getMemory().tick_info.links.head() }
    this.getPile      = function() { return this.getMemory().tick_info.piles.head() }
    this.getSite      = function() { return this.getMemory().tick_info.sites.head() }
    this.getHaulers   = function() { return this.getMemory().tick_info.haulers }
    this.getUpgraders = function() { return this.getMemory().tick_info.upgraders }

    this.getDropPos = function()
    {
        if(!this.getMemory().dropPos)
            this.getMemory().dropPos = this.findDropPos()
        return this.getMemory().dropPos
    }

    this.findDropPos = function()
    {
        var storage = this.getSpawn().getTakeEnergyStorage()
        var path = this.pos.findPathTo(storage, {ignoreCreeps: true})
        var dropPos = _(path).take(2).last()
        dropPos = { x:p.x, y:p.y }
        return dropPos
    }

    this.getStoreEnergyTarget = function()
    {
        var storage = this.getContainer()
        return storage ? storage : this.getDropPos()
    }

    this.getTakeEnergyStorage = function()
    {
        var pile = this.getPile()
        if(pile)
            return pile

        var link = this.getLink()
        if(link && link.energy)
            return link

        var container = this.getContainer()
        if(container && container.store[RESOURCE_ENERGY])
            return container
    }

    this.getExtensionCapacity = function()
    {
        switch(this.level)
        {
            case 7: return 100
            case 8: return 200
            default: return 50
        }
    }
}

exports = Controller
