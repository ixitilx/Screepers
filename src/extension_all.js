var cacheTick = -1
var cache = null

function getCachedObjectById(id)
{
    var tick = Game.time
    if(cacheTick != tick)
    {
        cache = new Object()
        cacheTick = tick
    }

    if(!cache[id])
        cache[id] = Game.getObjectById(id)
    return cache[id]
}

function getObjectByName(name, memory)
{
    var id = name + 'Id'
    var m = memory ? memory : this.memory
    if(m[id])
    {
        var obj = getCachedObjectById(m[id])
        if(obj)
            return obj
        delete m[id]
    }
}

var prototype = 
{
    getObjectByName: getObjectByName,
    getCachedObjectById: getCachedObjectById,
}

function extend(name, externalPrototype)
{
    for(prop in prototype)
    {
        if(externalPrototype[prop])
        {
            console.log('[' + name + '.' + prop + '] already exist')
        }
        else
        {
            externalPrototype[prop] = prototype[prop]
        }
    }
}

exports.extend = extend
