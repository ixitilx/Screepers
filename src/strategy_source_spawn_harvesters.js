var imp_constants = require('constants')
var imp_utils = require('utils')

var TASK_DONE = imp_constants.TASK_DONE

function getCreepWork(creep)       { return creep.getBody()[WORK] }
function getTotalWork(creepArray)  { return _.sum(creepArray.map(getCreepWork)) }
function getHarvestRooms()         { return [Game.spawns.Spawn1.room] }

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

    return spawn.createCreep(harvesterBody, null, memory)
}

exports.spawnHarvesters = spawnHarvesters
