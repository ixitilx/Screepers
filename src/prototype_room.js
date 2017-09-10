'use strict';

const logger = require('logger')
const Empire = require('empire')
const Screeps = require('screeps')

const ROLE_HAULER = 'Hauler'

function EnergySource(obj, haulers)
{
    this.id = obj.id
    this.pos = obj.pos
    this.amount = obj.amount || obj.energy || _.get(obj.store, RESOURCE_ENERGY, 0)

    const myHaulers = _.filter(haulers, h => h.memory.haul && h.memory.haul.id===obj.id)
    this.scheduled = _(myHaulers).map(h => h.freeCapacity).sum()
    this.available = this.amount - this.scheduled

    this.toString = function()
    {
        return 'EnergySource #' + this.id + ': ' + this.amount + '(' + this.available + ')'
    }
}

function EnergySink(obj, haulers, tickets)
{
    this.id = obj.id
    this.pos = obj.pos
    this.amount = obj.unusedEnergyCapacity || 1000000
    this.scheduled = _(tickets).filter(t => t.haulFrom == obj.id)
                               .map(t => haulers[t.haulerId].carryCapacity)
                               .sum()
    this.available = this.amount - this.scheduled
}

function findEnergySources(room, haulers)
{
    const res  = _(room.harvestedEnergy)
                    .map(src => new EnergySource(src, haulers))
                    .sortBy('available')
                    .reverse()
                    .value()

    const cont = _(room.sources)
                    .map(src => src.containersAround)
                    .flatten()
                    .map(src => new EnergySource(src, haulers))
                    .sortBy('available')
                    .reverse()
                    .value()

    return _([res, cont]).flatten().filter(src => src.available > 0).value()
}

function findEnergySinks(room)
{
    const energyConsumers = _(room.structures).filter(s=>s.unusedEnergyCapacity).value()
    const controller = room.controller.my ? room.controller : undefined
    const storage = room.storage
    return _([energyConsumers, [controller]])
        .flatten()
        .compact()
        .map(sink => new EnergySink(sink))
        // .filter(sink => sink.amount > sink.scheduled)
        .value()
}

function getBestHaulerBody(spawn)
{
    const count = Math.floor(spawn.room.energyCapacityAvailable / 100)
    return {carry:count, move:count}
}

Room.prototype.manageLogistics = function()
{
    const hAll = this.roomHaulers
    const hAvailable = _.filter(hAll, h => h.memory.haul===undefined)
    const [hLoaded, hEmpty] = _.partition(hAvailable, h=>_.sum(h.carry))
    const hSink = _.filter(hAll, h => h.memory.haul && !h.memory.haul.load)
    const hSource = _.filter(hAll, h => h.memory.haul && h.memory.haul.load)

    logger.info('Haulers:', 'all:'+_.size(hAll),
                            'available:'+_.size(hAvailable),
                            'loaded:'+_.size(hLoaded),
                            'empty:'+_.size(hEmpty),
                            'unload:'+_.size(hSink),
                            'load:'+_.size(hSource))

    // logger.info('Available:', _(hAvailable).map(h => h.name).join(', '))

    const sources = findEnergySources(this, hSource)
    // logger.info('sources:', _.size(sources))
    _.each(sources, s => logger.json_p(s))

    const roomName = this.name
    _.each(sources, function(src)
    {
        const h = _.pullAt(hEmpty, 0)
        if(!h || !h[0])
        {
            // Empire.queueCreep(getBestHaulerBody, {role:ROLE_HAULER, roomName: roomName}, roomName)
            return false
        }

        h[0].memory.haul = {id: src.id, pos: src.pos, load:true}
        hSource.push(h[0])
    })

    const sinks = findEnergySinks(this)

    function manageSink(sink)
    {
        const h = _.pullAt(hLoaded, 0)
        if(!h || !h[0])
        {
            // Empire.queueCreep(getBestHaulerBody, {role:ROLE_HAULER, roomName: roomName}, roomName)
            return false
        }
        h[0].memory.haul = {id: sink.id, pos: sink.pos, load:false}
        hSink.push(h[0])
    }

    _.each(sinks, manageSink)
}

Room.prototype.manage = function()
{

    //providers:
    //  energy resources near source
    //  container near source

    //consumers:
    //  spawn & extensions
    //  construction site
    //  controller

    //what to build?
    //  extensions

    //manage resource consumers and providers
    //build haulers & manage logistics
}

Room.prototype.plan = function(busy, free)
{
    if(!(this.name in Game.rooms))
        throw new Error("Called " + this + ".plan() for room not in Game.rooms")

    function runPlan(obj)
    {
        const ret = obj.plan( (busy[obj.id] || []), free)
        if(!ret)
            throw new Error(obj + '.plan() returned [' + ret + ']')
        _.each(ret.fired, c => c.managerId=undefined)
        free = _(ret.free).concat(ret.fired).value()
    }

    const runPlanTrace = logger.wrapTrace(runPlan)

    _.each(this.sources, runPlan)
    _.each(this.spawns,  runPlan)
}

Room.prototype.run = function(busy)
{
    if(!(this.name in Game.rooms))
        throw new Error("Called " + this + ".run() for room not in Game.rooms")

    _.each(this.sources, s => s.run(busy[s.id]))
    _.each(this.spawns,  s => s.run(busy[s.id]))
}

Room.prototype.createCreep = function(body, memory)
{
    let queued = false
    _.each(this.spawns, s => queued=queued||s.checkedCreateCreep(body, memory)==OK)
    return queued
}

function getSpawns()
{
    return _.filter(Game.spawns, s => s.room.name===this.name)
}

function getSources()
{
    return this.find(FIND_SOURCES)
}

function getStructures()
{
    return this.find(FIND_MY_STRUCTURES)
}

function getCreeps()
{
    return _.filter(Game.creeps, c => c.room.name===this.name)
}

function getHarvestedEnergy()
{
    return _(this.sources).map(src => src.resourcesAround).flatten().value()
}

function getLogisticsManager()
{
    return new RoomLogisticsManager(this)
}

function getRoomHaulers()
{
    return _.filter(Game.creeps, c => c.memory.roomName===this.name && c.memory.role===ROLE_HAULER)
}

function getResources()
{
    return this.find(FIND_DROPPED_RESOURCES)
}

function getSpawnEnergyCapacity()
{
    return this.energyCapacityAvailable
}

Screeps.newCachedProperty(Room, getSpawns,  'spawns')
Screeps.newCachedProperty(Room, getSources, 'sources')
Screeps.newCachedProperty(Room, getLogisticsManager, 'logisticsManager')

Screeps.newTickProperty(Room, getStructures, 'structures')
Screeps.newTickProperty(Room, getCreeps, 'creeps')
Screeps.newTickProperty(Room, getHarvestedEnergy, 'harvestedEnergy')
Screeps.newTickProperty(Room, getRoomHaulers, 'roomHaulers')
Screeps.newTickProperty(Room, getResources, 'resources')
Screeps.newTickProperty(Room, getSpawnEnergyCapacity, 'spawnEnergyCapacity')
