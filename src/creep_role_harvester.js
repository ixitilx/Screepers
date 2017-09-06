'use strict';

const logger = require('logger')

function controlHarvester()
{
    const source = Game.getObjectById(this.memory.sourceId)
    if(!source)
        throw new Error(this + '('+this.memory.role+') has unreachable sourceId [' + this.memory.sourceId + ']')
    const ret = this.harvest(source)
    if(ret == ERR_NOT_IN_RANGE)
        moveHarvester(this, source)
    else if([OK, ERR_BUSY, ERR_NOT_ENOUGH_RESOURCES].includes(ret))
        ;
    else
        throw new Error('Unexpected error. Creep[' + this.name+ '].harvest('+source.id+') returned ['+ret+']')
}

function moveHarvester(harvester, source)
{
    const ret = harvester.moveTo(source.pos, {reusePath:5, serialiseMemory:true})
    if([OK, ERR_BUSY, ERR_TIRED].includes(ret))
        return
    throw new Error('Unexpected error. Creep[' + harvester.name + '].moveByPath(memory.path) returned ['+ret+']')
}

exports.run = controlHarvester
