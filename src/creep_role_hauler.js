'use strict';

const logger = require('logger')

function controlHauler()
{
    const source = Game.getObjectById(this.memory.sourceId)
    if(this.memory.loading)
    {
        const ret = loadHauler(this, source)
        if(ret==OK)
            ;
        else if(ret==ERR_FULL)
            this.memory.loading = false

        this.memory.loading = _.sum(this.carry) < this.carryCapacity
    }
    else
    {
        const ret = unloadHauler(this, source)
        if(ret==OK)
            ;
        else if(ret==ERR_NOT_ENOUGH_RESOURCES)
            this.memory.loading = true
        else if(ret==ERR_FULL)
        {
            this.drop(RESOURCE_ENERGY)
        }
        this.memory.loading = _.sum(this.carry) == 0
    }
}

function loadHauler(hauler, source)
{
    const energies = source.lookAround(LOOK_RESOURCES)

    const target = _(energies).map(item => item.resource)
                              .filter({resourceType:'energy'})
                              .sortBy('amount')
                              .last()

    if(target)
    {
        const ret = hauler.pickup(target)
        if([OK, ERR_BUSY].includes(ret))
            return OK
        else if(ret==ERR_FULL)
            return ERR_FULL
        else if(ret==ERR_NOT_IN_RANGE)
            return moveHauler(hauler, target.pos)
        throw new Error('Unexpected error. Creep[' + hauler.name + '].pickup('+target+') returned ['+ret+']')
    }
}

function unloadHauler(hauler, source)
{
    const target = _(Game.spawns).map(s=>s).first()
    const ret = hauler.transfer(target, RESOURCE_ENERGY)
    if([OK, ERR_BUSY].includes(ret))
        return OK
    else if([ERR_FULL, ERR_NOT_ENOUGH_RESOURCES].includes(ret))
        return ret
    else if(ret==ERR_NOT_IN_RANGE)
        return moveHauler(hauler, target.pos)
    throw new Error('Unexpected error. Creep[' + hauler.name + '].transfer('+target+') returned ['+ret+']')
}

function moveHauler(hauler, pos)
{
    const ret = hauler.moveTo(pos, {reusePath:5, serialiseMemory:true})
    if([OK, ERR_BUSY, ERR_TIRED].includes(ret))
        return OK
    else if(ret==ERR_NOT_FOUND)
    {
        logger.error('Creep[' + hauler.name + '].moveByPath(memory.path) => ERR_NOT_FOUND')
        logger.error("Error doc: The specified path doesn't match the creep's location.")
        logger.error("Dropping creep's path")
        delete hauler.memory.path
        return OK
    }
    else
    {
        throw new Error('Unexpected error. Creep[' + hauler.name + '].moveByPath(memory.path) returned ['+ret+']')
    }
}

exports.run = controlHauler
