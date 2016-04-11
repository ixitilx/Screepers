var constants = require('constants')
var task = require('task')

function MoveTo(creep, dst)
{
    if(creep.pos.getRangeTo(dst)<=1)
        return constants.TASK_DONE
    if(Memory.autoBuildRoad && Memory.autoBuildRoad == 1)
        creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
    return creep.moveTo(dst)
}

function MoveToId(creep, id)
{
    return MoveTo(creep, Game.getObjectById(id))
}

function MoveToSource(creep)        { return MoveToId(creep, creep.memory.sourceId) }
function MoveToStorage(creep)       { return MoveToId(creep, creep.memory.storageId) }
function MoveToController(creep)    { return MoveTo(creep, creep.room.controller) }
function MoveToSite(creep)
{
    if(creep.memory.siteId)
        return MoveToId(creep, creep.memory.siteId)
    return constants.TASK_DONE
}

function HarvestEnergy(creep)
{
    if(_.sum(creep.carry) >= creep.carryCapacity)
        return constants.TASK_DONE

    var source = Game.getObjectById(creep.memory.sourceId)
    return creep.harvest(source)
}

function StoreEnergy(creep)
{
    var freeRoom = function(a) { return a.energyCapacity - a.energy }
    var storage = Game.getObjectById(creep.memory.storageId)
    if(storage==undefined || freeRoom(storage) == 0)
    {
        var isStorage = function(structure)
        {
            return structure.structureType == STRUCTURE_EXTENSION ||
                   structure.structureType == STRUCTURE_SPAWN
        }
        
        var mostFreeRoom = function(a, b) { return freeRoom(b) - freeRoom(a) }

        var storages = creep.room.find(FIND_MY_STRUCTURES, {filter: isStorage})
        storages.sort(mostFreeRoom)
        if(freeRoom(storages[0]) == 0)
            return ERR_FULL

        creep.memory.storageId = storages[0].id
        return StoreEnergy(creep)
    }
    return creep.transfer(storage, RESOURCE_ENERGY)
}

function UpgradeController(creep)
{
    var controller = creep.room.controller
    return creep.upgradeController(controller)
}

function Build(creep)
{
    var site = Game.getObjectById(creep.memory.siteId)
    if(site == undefined)
    {
        var bestType = function(a, b)
        {
            var typePriority = [STRUCTURE_ROAD, STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN]
            var idx_a = typePriority.indexOf(a.structureType)
            var idx_b = typePriority.indexOf(b.structureType)
            return idx_b - idx_a // higher priority -> earlier in sorted sequence
        }

        var mostProgress = function(a, b)
        {
            var pa = 1000000 * a.progress/a.progressTotal
            var pb = 1000000 * b.probress/b.progressTotal
            return pb - pa // higher progress -> earlier in sorted sequence
        }

        var leastDistanceFromSpawn = function(a, b)
        {
            return 0
        }

        var cmp = function(a, b)
        {
            var cmp = bestType(a, b)
            if(cmp)
                return cmp
            cmp = mostProgress(a, b)
            if(cmp)
                return cmp
            return leastDistanceFromSpawn(a, b)
        }

        var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
        sites.sort(cmp)
        if(sites==undefined || sites.length==0)
            return constants.TASK_DONE
        site = sites[0]
        creep.memory.siteId = site.id
    }

    var ret = creep.build(site)
    if(ret == ERR_INVALID_TARGET)
    {
        console.log('build:inval')
        delete creep.memory.siteId
        return constants.TASK_DONE
    }
    return ret
}

exports.MoveToSourceTask        = task.TaskFromDoFunc('move:harvest',   MoveToSource)
exports.MoveToStorageTask       = task.TaskFromDoFunc('move:store',     MoveToStorage)
exports.MoveToControllerTask    = task.TaskFromDoFunc('move:upgrade',   MoveToController)
exports.MoveToSiteTask          = task.TaskFromDoFunc('move:build',     MoveToSite)

exports.HarvestEnergyTask       = task.TaskFromDoFunc('harvest', HarvestEnergy)
exports.StoreEnergyTask         = task.TaskFromDoFunc('store',   StoreEnergy)
exports.UpgradeControllerTask   = task.TaskFromDoFunc('upgrade', UpgradeController)
exports.BuildTask               = task.TaskFromDoFunc('build',   Build)
