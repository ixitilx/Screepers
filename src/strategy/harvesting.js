//
// Harvester spawning strategy
//

var imp = {
    harvester: require('harvester')
}

var memory = null

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
    results.sort(containerPredicate)
    return results[0]
}

function setupSourceInfo(source)
{
    var storage   = findBestSpawn(source)
    var container = findContainer(source, FIND_MY_STRUCTURES)
    var site      = findContainer(source, FIND_MY_CONSTRUCTION_SITES)
    
    var info = memory.sources[source.id] = {
        storageId  : storage.id,
        containerId: container.id,
        siteId     : container ? undefined : site.id,
    }

    return info
}
//------------------------------

function manageSource(source)
{
    var sourceHarvesters = creepsByMemory({
        role    : 'harvester',
        sourceId: source.id
    })

    var totalWork = getTotalWork(sourceHarvesters)
    var needWork = imp.harvester.getWorkRequired(source)

    if(totalWork < needWork)
    {
        var spawn = findBestSpawn(source.room)
        imp.harvester.spawn(spawn, source)
    }
    else
    {
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
    if(Memory.strategies.harvesting == undefined)
    {
        Memory.strategies.harvesting = {
            enabled: false,
            sources: new Object()
        }

        memory = Memory.strategies.harvesting
    }
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
