'use strict';

const logger = require('logger')

Spawn.prototype.manage = function()
{
    const nc = this.memory.nextCreep
    if(!this.spawning && nc)
    {

        const ret = this.createCreep(nc.body, null, nc.memory)
        if(typeof(ret) == typeof(''))
        {
            logger.info(this + '.createCreep(' + nc.body + ') => ' + ret)
            delete this.memory.nextCreep
            return
        }

        if(ret == ERR_INVALID_ARGS)
        {
            logger.warning(spawn + '.createCreep() returned ERR_INVALID_ARGS (Body is not properly described).')
            logger.warning('nextCreep:' + JSON.stringify(spawn.memory.nextCreep))
            logger.warning('nextCreep deleted')
            delete spawn.memory.nextCreep
            return
        }

        if(ret == ERR_NOT_ENOUGH_ENERGY)
            return

        throw new Error('Unexpected error. ' + spawn + ' createCreep()=>' +ret+ '. Creep:' + JSON.stringify(spawn.memory.nextCreep))
    }
}

Spawn.prototype.queueCreep = function(body, memory)
{
    if(_.has(this.memory.nextCreep))
        return ERR_FULL
    if(typeof(body)=='function')
        body = body(this)
    if(typeof(memory)=='function')
        memory = memory(this)
    this.memory.nextCreep = {body:body, memory:memory}
    return OK
}

Object.defineProperty(
    Spawn.prototype,
    'canSpawn',
    {get: function() {return !_.has(this.memory, 'nextCreep')}}
)
