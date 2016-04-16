var imp_constants = require('constants')
var imp_utils = require('utils')

var TASK_DONE = imp_constants.TASK_DONE

function manageSpawn(spawn, structures)
{
    function sqr(a) {return a*a}
    function distanceSqr(a,b) {return sqr(b.pos.x-a.pos.x) + sqr(b.pos.y-a.pos.y) }
    function cmp(a, b) {return a==b ? 0 : (a<b?-1:1)}
    function less(a,b)
    {
        var sda = distanceSqr(spawn,a)
        var sdb = distanceSqr(spawn,b)
        var sdc = cmp(sda, sdb)
        if(sdc!=0)
            return sdc
        return cmp(a.id, b.id)
    }

    var getId = function(ext) {return ext.id}

    var extIds = structures[STRUCTURE_EXTENSION].sort(less).map(getId)

    spawn.memory.extensionIds = extIds
    return TASK_DONE
}

function cacheStructuresByRoom()
{
    var rooms = new Object()

    function hashByRoom(structure)
    {
        var roomId = structure.room.id
        var type = structure.structureType
        if(!rooms[roomId])
            rooms[roomId] = new Object()
        if(!rooms[roomId][type])
            rooms[roomId][type] = new Array()
        rooms[roomId][type].push(structure)
    }
    
    for(s in Game.structures)
        hashByRoom(Game.structures[s])

    return rooms
}

function run()
{
    var cache = cacheStructuresByRoom()

    var spawns = new Array()
    for(name in Game.spawns)
        spawns.push(Game.spawns[name])

    _.filter(spawns, {my:true}).forEach(function(spawn)
    {
        manageSpawn(spawn, cache[spawn.room.id])
    })
}

function initialize()
{
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
