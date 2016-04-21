var imp_constants = require('constants')
var imp_utils = require('utils')

function updateSpawnExtensions_(spawn, extensions)
{
    var distanceCache = new Object
    
    function sqr(a) {return a*a}
    function distanceSqr(a, b) {return sqr(b.pos.x-a.pos.x) + sqr(b.pos.y-a.pos.y) }
    function spawnDistanceSqr(a) {return distanceSqr(spawn, a)}
    function cachedSpawnDistanceSqr(a)
    {
        var cached = distanceCache[a.id]
        if(!cached)
            cached = distanceCache[a.id] = spawnDistanceSqr(a)
        return cached
    }
    function cmp(a,b) {return a==b ? 0 : (a<b?-1:1)}
    function less(a,b)
    {
        var full_a = a.energy==a.energyCapacity
        var full_b = b.energy==b.energyCapacity
        var full_cmp = cmp(full_a, full_b)
        if(full_cmp != 0) return full_cmp
        
        var dist_a = cachedSpawnDistanceSqr(a)
        var dist_b = cachedSpawnDistanceSqr(b)
        var dist_cmp = cmp(dist_a, dist_b)
        if(dist_cmp != 0) return dist_cmp

        return cmp(a.id, b.id)
    }
}

function updateSpawnExtensions(cache)
{
    var update = function(spawn)
    {
        var extensions = _.filter(cache.room_structures[spawn.room.id], imp_utils.filters.isExtension)
        return updateSpawnExtensions_(spawn, extensions)
    }

    _.filter(cache.structures, imp_utils.filters.isSpawn).forEach(update)

    return OK
}

exports.updateSpawnExtensions = updateSpawnExtensions
