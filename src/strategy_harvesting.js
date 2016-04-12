//
// Harvester spawning strategy
//

var imp_harvester = require('harvester')
var imp_utils = require('utils')

var findBestSpawn   = function(room)        { return Game.spawns.Spawn1 }  // or best spawn by other criteria
var getWork         = function(bodyPart)    { return bodyPart.type == WORK }
var getCreepWork    = function(creep)       { return _.sum(creep.body.map(getWork)) }
var getTotalWork    = function(creepArray)  { return _.sum(creepArray.map(getCreepWork)) }
var getHarvestRooms = function()            { return [Game.spawns.Spawn1.room] }

//------ SETUP SOURCE INFO ------
var isContainer = function(s) { return s.structureType == STRUCTURE_CONTAINER }
var containerFilter = { filter: function(s) { return isContainer(s) } }

function findContainer(source, what)
{
    var results = source.pos.findInRange(what, 1, containerFilter)
    return results[0]
}

function findContainerPos(source)
{
    var spawn = findBestSpawn(source.room)
    var path = source.pos.findPathTo(spawn, {ignoreCreeps: true})
    var pos = { x:path[0].x, y:path[0].y }
    return pos
}

function setupSourceInfo(source)
{
    var storage   = findBestSpawn(source)
    var container = findContainer(source, FIND_MY_STRUCTURES)
    var site      = findContainer(source, FIND_MY_CONSTRUCTION_SITES)

    var info = Memory.strategies.harvesting.sources[source.id] = new Object()
    if(storage)   info.storageId   = storage.id
    if(container) info.containerId = container.id
    else if(site) info.siteId      = site.id
    info.containerPos = findContainerPos(source)
    return info
}

function getSourceInfo(source) { return Memory.strategies.harvesting.sources[source.id] }
//------------------------------

function manageSource(source)
{
    var sourceHarvesters = imp_utils.creepsByMemory({
        role    : 'harvester',
        sourceId: source.id
    })

    var totalWork = getTotalWork(sourceHarvesters)
    var needWork = imp_harvester.getWorkRequired(source)

    if(totalWork < needWork)
    {
        var spawn = findBestSpawn(source.room)
        imp_harvester.spawn(spawn, source)
    }
    else
    {
        var info = getSourceInfo(source)
        if(!info)
            info = setupSourceInfo(source)

        var pos = new RoomPosition(info.containerPos.x, info.containerPos.y, source.room.name)

        if(info.siteId      && Game.getObjectById(info.siteId).pos      != pos) delete info.siteId
        if(info.containerId && Game.getObjectById(info.containerId).pos != pos) delete info.containerId
        if(!info.siteId && !info.containerId)
        {
            var filterContainer = { filter: function(s){ s.structureType==STRUCTURE_CONTAINER } }

            var containers = pos.findInRange(FIND_STRUCTURES, 0, filterContainer)
            var sites      = pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0, filterContainer)
            if(containers.length)
                info.containerId = containers[0].id
            else if(sites.length)
                info.siteId = sites[0].id
            else
                pos.createConstructionSite(STRUCTURE_CONTAINER)
        }

        // build container
        // build hauler
        // update storage for harvesters
        // update 'from' for hauler
        // build link
        // destroy container
    }
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

    for(roomName in Game.rooms)
        Game.rooms[roomName].find(FIND_SOURCES).forEach(setupSourceInfo)
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
