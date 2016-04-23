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

function getRoomId(item) { return item.room.id }

function buildCache()
{
    function findSites(room)
    {
        return room.find(FIND_CONSTRUCTION_SITES)
    }

    var creeps = imp_utils.serializeValues(Game.creeps)
    var rooms = imp_utils.serializeValues(Game.rooms)
    var spawns = imp_utils.serializeValues(Game.spawns)
    var structures = imp_utils.serializeValues(Game.structures)
    var sites = Array.prototype.concat.apply([], rooms.map(findSites))
    
    var room_creeps = imp_utils.indexArray(creeps, getRoomId)
    var room_structures = imp_utils.indexArray(structures, getRoomId)
    var room_sites = imp_utils.indexArray(sites, getRoomId)

    var cache =
    {
        rooms:              rooms,
        spawns:             spawns,

        creeps:             creeps,
        structures:         structures,
        sites:              sites,

        room_creeps:        room_creeps,
        room_structures:    room_structures,
        room_sites:         room_sites,
    }
    return cache
}

var spawnManagerSpawningStrategy =
{
    function makeMemory(spawn)
    {
        var memory =
        {
            role: 'spawn_manager',
            spawnId: spawn.id
        }
        return memory
    }

    function spawn(spawn)
    {
        var memory = makeMemory(spawn)
        return spawn.createCreep([CARRY, MOVE], null, memory)
    }
}

var upgraderSpawningStrategy =
{
    function makeMemory(spawn)
    {
        var memory =
        {
            role: 'upgrader',
            controllerId: spawn.room.controller.id,
        }
    }

    function getUpgraderBody(cap)
    {
        var bodyCost = Creep.prototype.bodyCost
        var workEnergy = cap - (bodyCost[MOVE] + bodyCost[CARRY])
        var body = new Object
        body[WORK] = Math.floor(workEnergy/bodyCost[WORK])
        body[CARRY] = 1
        body[MOVE] = 1
        return Creep.prototype.buildBodyArray(body)
    }

    function spawn(spawn)
    {
        var cap = spawn.getTotalEnergyCapacity()
        var body = getUpgraderBody(cap)
        var memory = makeMemory(spawn)
        return spawn.createCreep(body, null, memory)
    }
}

var haulerSpawningStrategy = 
{
    function getHaulerBody(energyCapacity)
    {
        var bodyCost = Creep.prototype.bodyCost
        var unitCost = 2*bodyCost[CARRY] + bodyCost[MOVE]
        var unitCount = Math.floor(energyCapacity / unitCost)
        var body = new Object()
        body[CARRY] = 2*unitCount
        body[MOVE] = unitCount
        return Creep.prototype.buildBodyArray(body)
    }

    function spawnHauler(spawn, from, to)
    {
        var capacity = spawn.getTotalEnergyCapacity()
        var haulerBody = getHaulerBody(capacity)
        var memory = {role:'hauler', ferryFromId:from.id, ferryToId:to.id}
        return spawn.createCreep(haulerBody, null, memory)
    }
}

exports.run = function()
{
    var cache = buildCache()

    imp_memorySweep.cleanupDeadCreepMemory(cache)
    imp_memorySweep.cleanupSpawnsMemory(cache)

    imp_manageSpawns.updateSpawnExtensions(cache)

    for(var i=0; i<cache.spawns.length; ++i)
    {
        var spawn = cache.spawns[i]
        var room = spawn.room
        imp_strategy_source.updateSourceCache(room)

        var spawnStatus = true

        for(var j=0; j<room.memory.sources.length; ++j)
        {
            var source = room.memory.sources[j]

            var ret = OK
            if(spawnStatus && (ret==OK||ret==TASK_DONE))
                ret = imp_spawnSourceHarvesters.spawnHarvesters(source)

            if(spawnStatus && (ret==OK||ret==TASK_DONE))
                ret = imp_strategy_source.spawnHauler(source)

            spawnStatus = ret==OK||ret==TASK_DONE

            if(spawnStatus)
                imp_strategy_source.buildContainer(source)
        }

        if(spawnStatus && room.controller && !room.controller.controller.getUpgrader())
        {
            ret = upgraderSpawningStrategy.spawn(spawn)
        }

        if(spawnStatus && room.controller && !room.controller.controller.getHauler())
        {
            ret = haulerSpawningStrategy.spawnHauler(spawn, spawn, room.controller)
        }

        if(spawnStatus && !spawn.getManager())
        {
            spawnManagerSpawningStrategy.spawn(spawn)
        }
    }

    imp_creepLoop.run()
}
