var imp_constants = require('constants')
var imp_utils = require('utils')

var TASK_DONE = imp_constants.TASK_DONE

var getCreepWork    = function(creep)       { return creep.getBody()[WORK] }
var getTotalWork    = function(creepArray)  { return _.sum(creepArray.map(getCreepWork)) }
var getHarvestRooms = function()            { return [Game.spawns.Spawn1.room] }

function getHarvesterBody(workUnits, energyCapacity)
{
    var bodyCost = Creep.prototype.bodyCost
    var body = new Object()
    var workEnergy = energyCapacity - (bodyCost[CARRY] + bodyCost[MOVE])
    body[WORK] = Math.min(workUnits, Math.floor(workEnergy/bodyCost[WORK]))
    body[CARRY] = 1
    body[MOVE] = 1

    return Creep.prototype.buildBodyArray(body)
}

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

function spawnHarvesters(source)
{
    var totalWork = getTotalWork(source.getHarvesters())
    var needWork = source.getWorkRequired()

    var shouldSpawn = totalWork < needWork
    if(!shouldSpawn)
        return TASK_DONE

    var spawn = source.getBestSpawn()
    var capacity = spawn.getTotalEnergyCapacity()
    var harvesterBody = getHarvesterBody(needWork, capacity)
    var memory = {role:'harvester', sourceId:source.id}

    console.log(harvesterBody)

    return spawn.createCreep(harvesterBody, null, memory)
}

function buildContainer(source)
{
    var cont = source.getBestStorage()
    if(cont)
        return TASK_DONE
    var site = source.getSite()
    if(site)
        return TASK_DONE
    var pos = source.getDropPos()
    var roomPos = new RoomPosition(pos.x, pos.y, source.room.name)
    return roomPos.createConstructionSite(STRUCTURE_CONTAINER)
}

function spawnHauler(source)
{
    var hauler = source.getHauler()
    if(hauler)
        return TASK_DONE
    var spawn = source.getBestSpawn()
    var capacity = spawn.getTotalEnergyCapacity()
    var haulerBody = getHaulerBody(capacity)
    var memory = {role:'hauler', ferryFrom:source.id, ferryTo:spawn.id}
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

function manageRoom(room)
{
    room.find(FIND_SOURCES).forEach(manageSource)
}

//--------------------------------------------------------
function run()
{
    if(Memory.strategies.harvesting.enabled == true)
        getHarvestRooms().forEach(manageRoom)
}

function initialize()
{
    //disabled by default
    if(!Memory.strategies.harvesting)
    {
        Memory.strategies.harvesting = {
            enabled: false,
            sources: new Object()
        }
    }
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
