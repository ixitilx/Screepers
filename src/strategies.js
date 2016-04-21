var imp_utils = require('utils')

var imp_memorySweep = require('strategy_memory_sweep')
var imp_creepLoop   = require('strategy_creep_loop')
var imp_manageSpawns = require('strategy_manage_spawns')

var imp_source = require('strategy_source')
var imp_harvesting = require('strategy_harvesting')
var imp_spawnSourceHarvesters = require('strategy_source_spawn_harvesters')
var imp_buildSourceContainer = require('strategy_source_build_containers')

function getRoomId(item) { return item.room.id }

function buildCache()
{
    var creeps = imp_utils.serializeValues(Game.creeps)
    var rooms = imp_utils.serializeValues(Game.rooms)
    var spawns = imp_utils.serializeValues(Game.spawns)
    var structures = imp_utils.serializeValues(Game.structures)
    var room_creeps = imp_utils.indexArray(creeps, getRoomId)
    var room_structures = imp_utils.indexArray(structures, getRoomId)

    var cache =
    {
        creeps:             creeps,
        rooms:              rooms,
        spawns:             spawns,
        structures:         structures,
        room_creeps:        room_creeps,
        room_structures:    room_structures,
    }
    return cache
}

var strategies = [imp_harvesting, imp_creepLoop]

exports.run = function()
{
    var cache = buildCache()

    imp_memorySweep.cleanupDeadCreepMemory(cache)
    imp_memorySweep.cleanupSpawnsMemory(cache)

    



/*
    ret = imp_manageSpawns.updateSpawnExtensions(cache)
    ret = imp_harvesting.updateSourceCache(cache)
    ret = imp_spawnSourceHarvesters.spawnHarvesters(cache)
    ret = imp_buildSourceContainer.buildContainer(cache)
*/
    strategies.forEach(function(strategy)
    {
        if(strategy.run)
            strategy.run()
    })
}
