require('extension_all').extend('Structure', Structure.prototype)

var Controller = require('extension_structure_controller')

Structure.prototype.prototypes = new Object()
Structure.prototype.prototypes[STRUCTURE_CONTROLLER] = new Controller()


function makeForwardFunc(name)
{
    function forwardFunc(args)
    {
        var proto = Structure.prototype.prototypes[this.structureType]
        var func = proto && proto[name] ? proto[name] : this[name]
        return func.apply(this, arguments)
    }
    return forwardFunc
}

function applyForwardFunc(name)
{
    if(Structure.prototype[name])
    {
        console.log('Structure.prototype.'+name, 'already exists!')
    }
    else
    {
        Structure.prototype[name] = makeForwardFunc(name)
    }
}

var methodNames = new Array()
for(var protoName in Structure.prototype.prototypes)
{
    var proto = Structure.prototype.prototypes[protoName]
    for(var methodName in proto)
        methodNames.push(methodName)
}

_(methodNames).uniq().forEach(applyForwardFunc)
