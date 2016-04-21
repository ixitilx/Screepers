var imp_task = require('task')
var imp_table = require('table')

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
        var roomId = indexer(item)
        if(!cache[roomId])
            cache[roomId] = new Array()
        cache[roomId].push(item)
    }

    array.forEach(indexItem)
    return cache
}

function serializeValues(obj)
{
    var array = new Array
    for(prop in obj)
        array.push(obj[prop])
    return array
}

exports.creepsByMemory = creepsByMemory
exports.indexArray = indexArray
exports.serializeValues = serializeValues
exports.filters = 
{
    isSpawn:    function(structure) {return structure && structure.structureType == STRUCTURE_SPAWN},
    isExtension:function(structure) {return structure && structure.structureType == STRUCTURE_EXTENSION},
}
