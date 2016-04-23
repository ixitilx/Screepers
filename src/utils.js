var imp_task = require('task')
var imp_table = require('table')

function distanceSq(a, b)
{
    var dx = a.x - b.x
    var dy = a.y - b.y
    return dx*dx + dy*dy
}

function creepsByMemory(memory)
{
    return _.filter(Game.creeps, function(creep)
    {
        for(prop in memory)
        {
            if(memory[prop] != creep.memory[prop])
                return false
        }
        return true
    });
}

function indexArray(array, indexer)
{
    var cache = new Object
    function indexItem(item)
    {
        var index = indexer(item)
        if(!cache[index])
            cache[index] = new Array()
        cache[index].push(item)
    }

    array.forEach(indexItem)
    return cache
}

function serializeObject(obj)
{
    var array = new Array
    for(var prop in obj)
        array.push([prop, obj[prop]])
    return array
}

function serializeValues(obj)
{
    var array = new Array
    for(var prop in obj)
        array.push(obj[prop])
    return array
}

exports.distanceSq = distanceSq
exports.creepsByMemory = creepsByMemory
exports.indexArray = indexArray
exports.serializeValues = serializeValues
exports.serializeObject = serializeObject
exports.filters = 
{
    isSpawn:    function(structure) {return structure && structure.structureType == STRUCTURE_SPAWN},
    isExtension:function(structure) {return structure && structure.structureType == STRUCTURE_EXTENSION},
}
