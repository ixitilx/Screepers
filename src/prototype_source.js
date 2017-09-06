'use strict';

const logger = require('logger')
const Empire = require('empire')

const ROLE_HAULER = 'Hauler'
const ROLE_HARVESTER = 'Harvester'

Object.prototype.getDefault.call(Memory, 'sources')

function isEnoughHaulers(source, haulers, harvesters)
{
    return _.size(haulers)>0
}

function isEnoughHarvesters(source, harvesters)
{
    const workParts = _(harvesters).map(h => h.getActiveBodyparts(WORK)).sum()
    return 600 * workParts >= source.energyCapacity || _.size(harvesters) >= _.size(source.spots)
}

function getBestHaulerBody(spawn)
{
    const count = Math.floor(spawn.room.energyCapacityAvailable/100)
    const body = {carry:count, move:count}
    return getCreepBody(body)
}

function getBestHarvesterBody(spawn)
{
    const count = Math.floor(spawn.room.energyCapacityAvailable/150)
    const body = {work:count, move:count}
    return getCreepBody(body)
}

function getCreepBody(bodyObj)
{
    return _(bodyObj).map( (count, name) => _.fill(Array(count), name))
                     .flatten().join(',').split(',')
}

Source.prototype.manage = function()
{
    if(!isEnoughHaulers(this, this.haulers, this.harvesters))
        Empire.queueCreep(getBestHaulerBody, {role:ROLE_HAULER, sourceId: this.id, loading:true}, this.pos)

    if(!isEnoughHarvesters(this, this.harvesters))
        Empire.queueCreep(getBestHarvesterBody, {role:ROLE_HARVESTER, sourceId: this.id}, this.pos)
}

Source.prototype.getCreepsByRole = function(role)
{
    return _.filter(Game.creeps, c => c.memory.sourceId===this.id && c.memory.role===role)
}

function getSpots(source)
{
    logger.trace(source, 'getSpots()')

    return  _(source.lookAround(LOOK_TERRAIN))
                       .filter(t => ['plain', 'swamp'].includes(t.terrain))
                       .map(spot => ( {x:spot.x, y:spot.y, roomName:source.room.name} ))
                       .value()
}

function Source_getSpots()
{
    return Object.prototype.getDefault.call(this.memory, 'spots', getSpots)
}

Object.defineProperty(Source.prototype, 'memory', {
    get: function(){return Object.prototype.getDefault.call(Memory.sources, this.id)},
    set: function(value){Memory.sources[this.id]=value}}
)
Object.defineProperty(Source.prototype, 'spots',      {get: function(){return getSpots(this)}})
Object.defineProperty(Source.prototype, 'harvesters', {get: function(){return this.getCreepsByRole(ROLE_HARVESTER)}} )
Object.defineProperty(Source.prototype, 'haulers',    {get: function(){return this.getCreepsByRole(ROLE_HAULER)}} )
