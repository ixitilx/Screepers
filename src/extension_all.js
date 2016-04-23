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
    var m = memory ? memory : this.memory
    if(m[name])
        return m[name]

    var id = name + 'Id'
    if(m[id])
    {
        var obj = getCachedObjectById(m[id])
        if(obj)
            return obj
        delete m[id]
    }
}

function setObjectByName(object, name, memory)
{
    var m = memory ? memory : this.memory

    if(object.id)
    {
        var id = name + 'Id'
        m[id] = object.id
    }
    else
    {
        m[name] = object
    }
}



var prototype = 
{
    getCachedObjectById: getCachedObjectById,

    getObjectByName: getObjectByName,
    setObjectByName: setObjectByName,
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
