var imp_constants = require('constants')
var imp_utils = require('utils')
var imp_spawnHarvesters = require('strategy_source_spawn_harvesters')

var TASK_DONE = imp_constants.TASK_DONE

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

function spawnHauler(source)
{
    if(source.getHaulers().size())
        return TASK_DONE
    var spawn = source.getSpawn()
    var capacity = spawn.getTotalEnergyCapacity()
    var haulerBody = getHaulerBody(capacity)
    var memory = {role:'hauler', ferryFromId:source.id, ferryToId:spawn.id}
    return spawn.createCreep(haulerBody, null, memory)
}

function manageSource(source)
{
    var progression = [spawnHarvesters, buildContainer, spawnHauler]
    for(var idx=0; idx<progression.length; ++idx)
    {
        var ret = progression[idx](source)
        if(ret != TASK_DONE)
            return ret
    }
    return TASK_DONE
}

function updateSourceCache(room)
{
    room.memory.sources = room.find(FIND_SOURCES)
}

function buildContainer(source)
{
    var cont = source.getStoreEnergyTarget()
    if(cont && cont.id)
        return TASK_DONE
    var site = source.getSite()
    if(site)
        return TASK_DONE
    var pos = source.getDropPos()
    var roomPos = new RoomPosition(pos.x, pos.y, source.room.name)
    return roomPos.createConstructionSite(STRUCTURE_CONTAINER)
}

function manageSource(source)
{
    /*
        consider free room (slots) around source
        calculate paths to/from slots
        priorities:
            update info
                slots
                site
                container
            build harvesters    // keep harvesting stats
                at most 5 work
                at most [freeroom] units
            build haulers       // if there is pile of energy - build more
            build container
            build road          // involves builder (or maintenance bot)
                                // should hauler have work module and do maintenance?
                                // should routes be kept by maintenance module?
            if(hasSpawn) build link
    */
}

// exports.updateRoomSourceCache = updateRoomSourceCache
exports.buildContainer = buildContainer
exports.updateSourceCache = updateSourceCache
exports.spawnHauler = spawnHauler
