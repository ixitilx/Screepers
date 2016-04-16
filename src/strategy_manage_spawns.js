var imp_constants = require('constants')
var imp_utils = require('utils')

var TASK_DONE = imp_constants.TASK_DONE

function manageSpawn(spawn)
{
    function sqr(a) {return a*a}
    function distanceSqr(a,b) {return sqr(b.pos.x-a.pos.x) + sqr(b.pos.y-a.pos.y) }
    function spawnDistanceSqr(a) {return distanceSqr(spawn, a)}
    function less(a,b)
    {
        var sda = spawnDistance(a)
        var sdb = spawnDistance(b)
        if(sda != sdb) return sda - sdb
        if(a.id==b.id) return 0
        if(a.id <b.id) return -1
        return 1
    }

    var filter = {my: true, structureType:STRUCTURE_EXTENSION}
    var getId = function(ext) {return getId}
    spawn.memory.extensionIds = _.filter(spawn.room.structures, filter).sort(less).map(getId)
    return TASK_DONE
}

//--------------------------------------------------------
function run()
{
    var spawns = new Array()
    for(name in Game.spawns)
        spawns.push(Game.spawns[name])
    _.filter(spawns, {my: true}).forEach(manageSpawn)
}

function initialize()
{
}

//--------------------------------------------------------
exports.run = run
exports.initialize = initialize
