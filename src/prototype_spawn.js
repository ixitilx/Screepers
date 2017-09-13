'use strict';

const logger = require('logger')

const ROLE_HAULER = 'Hauler'

Spawn.prototype.getHaulerRequirements = function(haul)
{
    const energyNeed = this.energyCapacity - this.energy
    const energyIncoming = _(haul).map(h=>h.carry[RESOURCE_ENERGY]).sum()
    return {moreEnergy: 1000000}
    return {moreEnergy: energyNeed - energyIncoming}
}

Spawn.prototype.hireHaulers = function(free, req)
{
    const hired = []

    function hire(creeps, id)
    {
        while(req.moreEnergy>0 && _.size(creeps))
        {
            const h = creeps.pop()
            h.managerId = id
            hired.push(h)
            req.moreEnergy -= h.carry[RESOURCE_ENERGY]
        }
    }

    const haulers = _.filter(free, c => c.memory.role===ROLE_HAULER && c.carry[RESOURCE_ENERGY]>0)

    let [small, big] = _.partition(haulers, c => c.carry[RESOURCE_ENERGY]<req.moreEnergy)
    small = _.sortBy(small, c=>c.carry[RESOURCE_ENERGY])
    big = _(big).sortBy(c=>c.carry[RESOURCE_ENERGY]).reverse().value()

    hire(big, this.id)
    hire(small, this.id)

    const hiredById = _.indexBy(hired, 'id')
    const freeById = _.indexBy(free, 'id')
    _.each(_.keys(hiredById), k => delete freeById[k])

    return {free:_.map(freeById), req:req}
}

Spawn.prototype.createMoreHaulers = function(req)
{
    return req
}


Spawn.prototype.plan = function(busy, free)
{
    let haul, req, ret
    logger.trace(this, 'plan', 'busy', JSON.stringify(busy))
    logger.trace(this, 'plan', 'free', JSON.stringify(free))
    ret = {fired:[], free:free}

    // logger.info(this, 'plan', 'busy', busy);
    [haul, busy] = _.partition(busy, c => c.memory.role===ROLE_HAULER && c.carry[RESOURCE_ENERGY]>0)
    // logger.info(this, 'plan', 'haul', haul)
    // logger.info(this, 'plan', 'fire', busy)
    req = this.getHaulerRequirements(haul)
    ret = this.hireHaulers(free, req)
    free = ret.free
    req = ret.req
    req = this.createMoreHaulers(req);

    ret = {fired:busy, free:free}
    if(_.size(busy))
        logger.info(this, 'fired', busy)
    logger.trace(this, 'plan', 'return', JSON.stringify(ret))
    return ret
}

Spawn.prototype.runHauler = function(hauler)
{
    if(!hauler.pos.isNearTo(this.pos))
    {
        hauler.checkedMoveTo(this)
    }
    else
    {
        const ret = hauler.unloadCargo(this)
        if(ret===ERR_FULL)
            hauler.drop(RESOURCE_ENERGY)
    }
}

Spawn.prototype.run = function(busy)
{
    _.each(busy, this.runHauler, this)
}

Spawn.prototype.checkedCreateCreep = function(body, memory)
{
    if(this._calledCheckedCreateCreep)
        return ERR_BUSY

    const ret = this.createCreep(body, null, memory)
    if(typeof(ret)==='string' && (ret in Game.creeps))
    {
        logger.info(this, 'created a creep. Body:', body, 'Memory:', JSON.stringify(memory))
        this._calledCheckedCreateCreep = true
        return Game.creeps[ret]
    }

    if(ret===ERR_INVALID_ARGS)
    {
        throw new Error(this + '.createCreep('+ body +') returned [ERR_INVALID_ARGS] (Body is not properly described).')
    }

    if([ERR_BUSY, ERR_NOT_ENOUGH_ENERGY].includes(ret))
    {
        return ret
    }

    throw new Error(this + '.createCreep('+ body +') returned [' + ret + '] (Unexpected error)')
}

// Spawn.prototype.queueCreep = function(body, memory)
// {
//     if(_.has(this.memory, 'nextCreep'))
//         return ERR_FULL
//     while(typeof(body)=='function')
//         body = body(this)
//     while(typeof(memory)=='function')
//         memory = memory(this)

//     logger.trace(this, 'queueCreep', 'body', JSON.stringify(body))
//     logger.trace(this, 'queueCreep', 'memory', JSON.stringify(memory))
//     this.memory.nextCreep = {body:body, memory:memory}
//     return OK
// }

// Object.defineProperty(
//     Spawn.prototype,
//     'canSpawn',
//     {get: function() {return !_.has(this.memory, 'nextCreep')}}
// )
