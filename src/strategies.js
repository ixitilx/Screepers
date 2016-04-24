var imp_constants = require('constants')
var imp_utils = require('utils')

var imp_memorySweep = require('strategy_memory_sweep')
var imp_creepLoop   = require('strategy_creep_loop')
var imp_manageSpawns = require('strategy_manage_spawns')

var imp_strategy_source = require('strategy_source')
var imp_harvesting = require('strategy_harvesting')
var imp_spawnSourceHarvesters = require('strategy_source_spawn_harvesters')
var imp_buildSourceContainer = require('strategy_source_build_containers')

var TASK_DONE = imp_constants.TASK_DONE

function getRoomName(item) { return item.room.name }

function buildCache()
{
    function findSites(room) { return room.find(FIND_CONSTRUCTION_SITES) }
    function findResources(room) { return room.find(FIND_DROPPED_RESOURCES) }
    function findSources(room) { return room.find(FIND_SOURCES) }
    function findStructures(room) { return room.find(FIND_STRUCTURES) }

    var rooms = imp_utils.serializeValues(Game.rooms)
    var spawns = imp_utils.serializeValues(Game.spawns)

    var creeps = imp_utils.serializeValues(Game.creeps)
    var structures = Array.prototype.concat.apply([], rooms.map(findStructures))
    var sites = Array.prototype.concat.apply([], rooms.map(findSites))
    var resources = Array.prototype.concat.apply([], rooms.map(findResources))
    var sources = Array.prototype.concat.apply([], rooms.map(findSources))
    
    var room_creeps = imp_utils.indexArray(creeps, getRoomName)
    var room_structures = imp_utils.indexArray(structures, getRoomName)
    var room_sites = imp_utils.indexArray(sites, getRoomName)
    var room_resources = imp_utils.indexArray(resources, getRoomName)
    var room_sources = imp_utils.indexArray(sources, getRoomName)

    var cache =
    {
        rooms:              rooms,
        spawns:             spawns,

        creeps:             creeps,
        structures:         structures,
        sites:              sites,
        resources:          resources,
        sources:            sources,

        room_creeps:        room_creeps,
        room_structures:    room_structures,
        room_sites:         room_sites,
        room_resources:     room_resources,
        room_sources:       room_sources,
    }
    return cache
}

var spawnManagerSpawningStrategy =
{
    makeMemory: function(spawn)
    {
        var memory =
        {
            role: 'spawn_manager',
            spawnId: spawn.id
        }
        return memory
    },

    spawnManager: function(spawn)
    {
        var memory = this.makeMemory(spawn)
        return spawn.createCreep([CARRY, MOVE], null, memory)
    },
}

var upgraderSpawningStrategy =
{
    makeMemory: function(spawn)
    {
        var memory =
        {
            role: 'upgrader',
            controllerId: spawn.room.controller.id,
        }
        return memory
    },

    getUpgraderBody: function(cap)
    {
        var bodyCost = Creep.prototype.bodyCost
        var workEnergy = cap - (bodyCost[MOVE] + bodyCost[CARRY])
        var body = new Object
        body[WORK] = Math.floor(workEnergy/bodyCost[WORK])
        body[CARRY] = 1
        body[MOVE] = 1
        return Creep.prototype.buildBodyArray(body)
    },

    spawnUpgrader: function(spawn)
    {
        var cap = spawn.getTotalEnergyCapacity()
        var body = this.getUpgraderBody(cap)
        var memory = this.makeMemory(spawn)
        return spawn.createCreep(body, null, memory)
    },
}

var haulerSpawningStrategy = 
{
    getHaulerBody: function(energyCapacity)
    {
        var bodyCost = Creep.prototype.bodyCost
        var unitCost = 2*bodyCost[CARRY] + bodyCost[MOVE]
        var unitCount = Math.floor(energyCapacity / unitCost)
        var body = new Object()
        body[CARRY] = 2*unitCount
        body[MOVE] = unitCount
        return Creep.prototype.buildBodyArray(body)
    },

    spawnHauler: function(spawn, from, to)
    {
        var capacity = spawn.getTotalEnergyCapacity()
        var haulerBody = this.getHaulerBody(capacity)
        var memory = {role:'hauler', ferryFromId:from.id, ferryToId:to.id}
        return spawn.createCreep(haulerBody, null, memory)
    },
}

exports.run = function()
{
    var cache = buildCache()

    imp_memorySweep.cleanupDeadCreepMemory(cache)
    imp_memorySweep.cleanupSpawnsMemory(cache)

    for(var i=0; i<cache.spawns.length; ++i)
    {
        var spawn = cache.spawns[i]
        spawn.extractTickInfo(cache)
        
        var room = spawn.room
        var spawnStatus = true
        var roomSources = cache.room_sources[room.name]

        for(var j=0; j<roomSources.length; ++j)
        {
            var source = roomSources[j]
            var info = source.extractTickInfo(cache)

            var ret = OK
            if(spawnStatus && (ret==OK||ret==TASK_DONE))
                ret = imp_spawnSourceHarvesters.spawnHarvesters(source)

            if(spawnStatus && (ret==OK||ret==TASK_DONE))
                ret = imp_strategy_source.spawnHauler(source)

            spawnStatus = ret==OK||ret==TASK_DONE

            if(spawnStatus)
                imp_strategy_source.buildContainer(source)
        }

/*
        if(spawnStatus && room.controller && !room.controller.controller.getUpgrader())
        {
            ret = upgraderSpawningStrategy.spawnUpgrader(spawn)
        }

        if(spawnStatus && room.controller && !room.controller.controller.getHauler())
        {
            ret = haulerSpawningStrategy.spawnHauler(spawn, spawn, room.controller)
        }
*/
        if(spawnStatus && !spawn.getManager())
        {
            haulerSpawningStrategy.spawnHauler(spawn, spawn, spawn)
        }
    }

    imp_creepLoop.run()
}
