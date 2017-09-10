'use strict';

const logger = require('logger')
const Empire = require('empire')

function haul(creep, from, to)
{
    if(creep.memory.haulFrom || creep.memory.haulTo)
        return ERR_BUSY
    creep.memory.haulFrom = from.id
    creep.memory.haulTo = to.id
    return OK
}

function run(creep)
{
    if(creep.memory.haulFrom)
    {
        const ret = loadHauler(this, source)
        if(ret==OK)
            ;
        else if(ret==ERR_FULL)
            this.memory.loading = false
    }
}

function controlHauler()
{
    if(!this.memory.haul)
    {
        logger.trace(this, 'is missing memory.haul, idling')
        return
    }

    if(!this.memory.haul.pos || !this.memory.haul.id || this.memory.haul.load===undefined)
    {
        logger.warning(this, 'memory.haul appears to be corrupted:', JSON.stringify(this.memory.haul))
        delete this.memory.haul
        return
    }

    const carry = _.sum(this.carry)

    if(this.memory.haul.load && carry >= this.carryCapacity)
    {
        logger.warning(this, 'configured to load, but has no free room')
        delete this.memory.haul
        return
    }

    if(!this.memory.haul.load && carry===0)
    {
        logger.warning(this, 'configured to unload, but has no cargo')
        delete this.memory.haul
        return
    }

    const obj = Empire.getObjectById(this.memory.haul.id)
    if(!obj)
    {
        logger.warning(this, 'has stale target')
        delete this.memory.haul
        return
    }

    if(!this.memory.haul.load && obj.unusedEnergyCapacity===0)
    {
        logger.warning(this, 'configured to unload, but target cannot accept any more energy')
        delete this.memory.haul
        return
    }

    const pos = this.memory.haul.pos
    const roomPos = new RoomPosition(pos.x, pos.y, pos.roomName)

    const action = this.memory.haul.load ? this.loadCargo : this.unloadCargo

    if(this.memory.move || ERR_NOT_IN_RANGE==action.call(this, obj))
        this.checkedMoveTo(roomPos)//, harvesterCostCallback)
    else
        delete this.memory.haul
    return


    const ret = this.checkedMoveTo(roomPos)
    if(ret==OK)
    {
        if(this.memory.haulFrom)
        {
            this.loadCargo(this.memory.haulFrom.id)
            delete this.memory.haulFrom
        }
        else if(this.memory.haulTo)
        {
            this.unloadCargo(this.memory.haulTo.id)
            delete this.memory.haulTo
        }
    }
}

exports.run = controlHauler
