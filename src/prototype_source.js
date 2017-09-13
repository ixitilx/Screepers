'use strict';

const logger = require('logger')
const Empire = require('empire')
const Screeps = require('screeps')

const ROLE_HARVESTER = 'Harvester'
const ROLE_HAULER = 'Hauler'

Screeps.newMemoryProperty(Source, getSpots, 'spots', 'sources')

function getHarvesterBody(maxWork, energy)
{
    const cost = BODYPART_COST[MOVE] + BODYPART_COST[WORK]
    const count = Math.min(maxWork, Math.floor(energy/cost))
    return Screeps.buildCreepBodyArray([[WORK, count], [MOVE, count]])
}

function getHaulerBody(energy)
{
    const cost = BODYPART_COST[MOVE] + BODYPART_COST[CARRY]
    const count = Math.floor(energy/cost)
    return Screeps.buildCreepBodyArray([[CARRY, count], [MOVE, count]])
}

function getSpots()
{
    logger.trace(this, 'getSpots()')
    return  _(this.lookAround(LOOK_TERRAIN))
                        .filter(t => ['plain', 'swamp'].includes(t.terrain))
                        .map(spot => ( {x:spot.x, y:spot.y, roomName:this.room.name} ))
                        .value()
}

Source.prototype.getHaulerRequirements = function(haulers)
{
    const energyHas = _(this.resourcesAround)
                            .filter({resourceType:RESOURCE_ENERGY})
                            .map(r => r.amount)
                            .sum()

    const capacityHas = _(haulers)
                            .map(h => h.freeCapacity)
                            .sum()

    const req = {freeCapacity:energyHas-capacityHas}
    logger.trace(this, 'getHaulerRequirements', 'return', JSON.stringify(req))
    return req
}

Source.prototype.hireHaulers = function(freeCreeps, req)
{
    const hired = []

    function hire(creeps, id)
    {
        while(req.freeCapacity>0 && _.size(creeps))
        {
            const h = creeps.pop()
            h.managerId = id
            hired.push(h)
            req.freeCapacity -= h.freeCapacity
        }
    }

    const haulers = _.filter(freeCreeps, c => c.memory.role===ROLE_HAULER && c.freeCapacity>0)

    let [small, big] = _.partition(haulers, c => c.freeCapacity<req.freeCapacity)
    small = _.sortBy(small, c=>c.freeCapacity)
    big = _(big).sortBy(c=>c.freeCapacity).reverse().value()

    hire(big, this.id)
    hire(small, this.id)

    const hiredById = _.indexBy(hired, 'id')
    const freeById = _.indexBy(freeCreeps, 'id')
    _.each(_.keys(hiredById), k => delete freeById[k])

    return {free:_.map(freeById), req:req}
}

Source.prototype.createMoreHaulers = function(req)
{
    const m = {role:ROLE_HAULER, managerId:this.id}
    while(req.freeCapacity>0)
    {
        const b = getHaulerBody(this.room.spawnEnergyCapacity)
        const c = b.count(CARRY) * CARRY_CAPACITY
        if(this.room.createCreep(b, m)!=OK)
            break
        req.freeCapacity -= c
    }

    return req
}


Source.prototype.getHarvesterRequirements = function(harvesters)
{
    // find if we need more harvesters
    const hasCount = _.size(harvesters)
    const needCount = _.size(this.spots)

    // find how many more work we need
    const hasWork  = _(harvesters).map(h => h.partCount[WORK]).sum()
    const needWork  = Math.ceil(this.energyCapacity / (HARVEST_POWER*ENERGY_REGEN_TIME))

    const req = {count: needCount-hasCount, work: needWork-hasWork}
    logger.trace(this, 'getHarvesterRequirements', 'return', JSON.stringify(req))
    return req
}

Source.prototype.hireHarvesters = function(free, req)
{
    logger.trace(this, 'hireHarvesters', 'free', free)
    logger.trace(this, 'hireHarvesters', 'req', JSON.stringify(req))
    const hired = []

    function hire(creeps, id)
    {
        while(req.count>0 && req.work>0 && _.size(creeps))
        {
            const h = creeps.pop()
            h.managerId = id
            hired.push(h)

            logger.info(id, 'hired', h)

            req.count -= 1
            req.work -= h.partCount[WORK]
        }
    }

    const harv = _.filter(free, c => c.memory.role===ROLE_HARVESTER)
    let [small, big] = _.partition(harv, c => c.partCount[WORK] < req.work)
    small = _.sortBy(small, c=>c.partCount[WORK])
    big = _(big).sortBy(c=>c.partCount[WORK]).reverse().value()

    hire(big, this.id)
    hire(small, this.id)

    const hiredById = _.indexBy(hired, 'id')
    const freeById = _.indexBy(free, 'id')
    _.each(_.keys(hiredById), k => delete freeById[k])
    free = _.map(freeById, c=>c)
    
    const ret = {free:free, req:req}
    logger.trace(this, 'hireHarvesters', 'return', JSON.stringify(ret))
    return ret
}

Source.prototype.createMoreHarvesters = function(req)
{
    const m = {role:ROLE_HARVESTER, managerId:this.id}
    while(req.count>0 && req.work>0)
    {
        const b = getHarvesterBody(req.work, this.room.spawnEnergyCapacity)
        const w = b.count(WORK)
        if(this.room.createCreep(b, m)!=OK)
            break
        req.count -= 1
        req.work  -= w
    }

    return req
}

Source.prototype.plan = function(creeps, free)
{
    logger.trace(this, 'plan', 'creeps', creeps)
    logger.trace(this, 'plan', 'free', free)

    let haul, harv, busy, ret, req

    [haul, busy] = _.partition(creeps, c => c.memory.role===ROLE_HAULER && c.freeCapacity>0)
    req = this.getHaulerRequirements(haul)
    ret = this.hireHaulers(free, req)
    free = ret.free
    req = ret.req
    req = this.createMoreHaulers(req);

    [harv, busy] = _.partition(busy, c => c.memory.role===ROLE_HARVESTER)
    req = this.getHarvesterRequirements(harv)
    ret = this.hireHarvesters(free, req)
    free = ret.free
    req = ret.req
    req = this.createMoreHarvesters(req)

    ret = {fired:busy, free:free}
    if(_.size(busy))
        logger.info(this, 'fired', busy)
    logger.trace(this, 'plan', 'return', JSON.stringify(ret))
    return ret
}

Source.prototype.runHarvester = function([harvester, spot])
{
    Screeps.assert(harvester &&
                   harvester instanceof Creep &&
                   harvester.memory &&
                   harvester.memory.role===ROLE_HARVESTER &&
                   harvester.name in Game.creeps)

    if(!Screeps.samePos(harvester.pos, spot))
        return harvester.checkedMoveTo(spot)
    return harvester.harvest(this)
}

Source.prototype.runHauler = function(hauler, energy)
{
    Screeps.assert(hauler && energy)

    const res = _(energy).filter(e => hauler.pos.isNearTo(e.pos)).first()

    if(res)
        hauler.loadCargo(res)
    else if(energy[0])
        hauler.checkedMoveTo(energy[0].pos, 1)
}

Source.prototype.getHarvesters = function()
{
    const creeps = _.filter(Game.creeps, c => c.memory.role===ROLE_HARVESTER &&
                                             (c.memory.sourceId===this.id ||
                                              c.memory.managerId===this.id))
    return creeps
}

Source.prototype.getWorkNeeded = function()
{
    return Math.ceil(this.energyCapacity / (HARVEST_POWER*ENERGY_REGEN_TIME))
}

Source.prototype.harvest = function()
{
    const harv = this.getHarvesters()
    const spots = this.spots

    let count = _.size(harv)
    let work = _(harv).map(c => c.partCount[WORK]).sum()
    const workNeeded = this.getWorkNeeded()

    while(count < _.size(spots) &&
          work < workNeeded)
    {
        const ret = this.room.createCreep(Roles.Harvester, this.source)
        if(!ret instanceof Creep)
            break
        harv.push(ret)
        count += 1
        work += harv.partCount[WORK]
    }

    const n = Math.min(_.size(this.spots), _.size(harv))
    if(_.size(harv) > n)
        logger.warning(this, 'got', _.size(harv), 'harvesters, but only', _.size(this.spots), 'spots')

    const nSpots = _.take(this.spots, n)
    const nHarvs = _.take(harv, n)
    const nZip = _.zip(nHarvs, nSpots)

    _.each(nZip, this.runHarvester, this)
}

Source.prototype.run = function(creeps)
{
    this.harvest()
    // this supposed to be in the room
    const nrg = _(this.resourcesAround).filter({resourceType:RESOURCE_ENERGY}).sortBy('amount').reverse().value()
    const haul = _.filter(creeps, c => c.memory.role===ROLE_HAULER)
    _.each(haul, h=>this.runHauler(h, nrg), this )
}
