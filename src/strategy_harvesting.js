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

function findContainerPos(source)
{
    var spawn = findBestSpawn(source.room)
    var path = source.pos.findPathTo(spawn, {ignoreCreeps: true})
    var pos = { x:path[0].x, y:path[0].y }
    return pos
}

//------------------------------

function samePos(a, b)
{
    return a.x == b.x && a.y == b.y  && a.roomName == b.roomName
}

function getObjectById(id, containerPos)
{
    var obj = Game.getObjectById(id)
    var isValid = (obj && obj.structureType &&
                   obj.structureType==STRUCTURE_CONTAINER &&
                   obj.pos && samePos(obj.pos, containerPos))
    return isValid ? obj : null
}

function findObjectAtPos(findConst, containerPos)
{
    var filter = { filter: function(s) {return s.structureType==STRUCTURE_CONTAINER} }
    var objects = containerPos.findInRange(findConst, 0, filter)
    return objects.length ? objects[0] : null
}

function manageObject(id, pos, findConst)
{
    var obj = id ? getObjectById(id, pos) : null
    if(!obj) obj = findObjectAtPos(findConst, pos)
    return obj
}

function readInfo(source)
{
    var info = Memory.strategies.harvesting.sources[source.id]
    if(!info) info = {containerPos: null, siteId: null, containerId: null}
    return info
}

function manageSource(source)
{
    var info = readInfo(source)
    if(!info.containerPos)
        info.containerPos = findContainerPos(source)
    
    var pos = new RoomPosition(info.containerPos.x, info.containerPos.y, source.room.name)
    var site = manageObject(info.siteId, pos, FIND_MY_CONSTRUCTION_SITES)
    var cont = manageObject(info.containerId, pos, FIND_STRUCTURES)

    info.siteId      = site ? site.id : null
    info.containerId = cont ? cont.id : null

    Memory.strategies.harvesting.sources[source.id] = info

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
        if(!site && !cont)
            pos.createConstructionSite(STRUCTURE_CONTAINER)

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
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
