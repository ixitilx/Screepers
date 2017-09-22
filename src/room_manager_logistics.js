'use strict';

exports.getLogisticsQueue = getLogisticsQueue

//
// energy hauling priorities
// where to put(get) energy?
//p  spn spawns & extensions (creep spawning)
//p  twr towers
//gp bld construction site (assigned workers, nearby dropped energy)
//gp con controller (assigned workers, nearby container or link)
//gp cap other structures with (energy/energyCapacity)
//gp trm terminal or link/container in base
//p  wll walls (assigned workers)
//p  rmp ramparts (assigned workers)
//p  nkr nuker ?
//gp str storage
//g  src source (and assigned harvesters, nearby dropped energy, containers and links)
//g  nrg dropped energy
//

const order = {
    byFreeCapacity: structure => structure.energy - structure.energyCapacity,
    byRemainingProgress: obj => obj.progress - obj.progressTotal,
    byAmount: res => res.amount,
    byEnergy: obj => obj.energy,
}

const criteria = {
    isEnergyRes: res => (res.resourceType === RESOURCE_ENERGY),
    isOtherStruct: str => (![STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER].includes(str.structureType)),
    isEnergyUser: obj => !_.isUndefined(obj.energy) && !_.isUndefined(obj.energyCapacity),
}

function getDroppedEnergyAround(pos)
{
    return _(pos.lookAround(LOOK_RESOURCES))
                    .map(rec => rec.resource)
                    .filter(criteria.isEnergyRes)
                    .sortBy(order.byAmount)
                    .value()
}

function getLogisticsQueue(room, data)
{
    const structuresByType = _.groupBy(data.structures, 'structureType')
    const creepsByRole = _.groupBy(data.creeps, 'memory.role')

    function getItems(collection, key, filterCriteria, orderCriteria)
    {
        return _(_.get(collection, key, []))
                            .filter( (filterCriteria ? _.identity : filterCriteria) )
                            .sortBy( (orderCriteria ? _.identity : orderCriteria) )
                            .value()
    }

    function getStructsByType(type)
    {
        return getItems(structuresByType, type, null, order.byFreeCapacity)
    }

    function getCreepsByTarget(role, targetId)
    {
        return getItems(creepsByRole, role, {memory:{targetId:targetId}}, order.byEnergy)
    }

    function siteNrg(site)
    {
        const siteWorkers = getCreepsByTarget(ROLE_WORKER, site.id)
        const eDrops = getDroppedEnergyAround(site.pos)
        return _(workers).concat(eDrops)
    }

    function contNrg(controller)
    {
        const workers = getCreepsByTarget(ROLE_WORKER, controller.id)
        const cont = controller.memory.containerId && Game.getObjectById(controller.memory.containerId)
        if(cont)
            workers.push(cont)
        return workers
    }

    function sourceNrg(source)
    {
        const hrv = _(source.pos.lookAround(LOOK_CREEPS))
                                .map(c => c.creep)
                                .filter(c => c.memory.role === ROLE_HARVESTER)
                                .filter(c => c.pos.isNearTo(source.pos))
                                .sortBy(order.byEnergy)
                                .value()
        const nrg = getDroppedEnergyAround(source.pos)
        const cont = source.memory.containerId && Game.getObjectById(source.memory.containerId)
        return _(hrv).concat(cont ? cont : [], nrg).value()
    }

    const ext = getStructsByType(STRUCTURE_EXTENSION)
    const spn = getStructsByType(STRUCTURE_SPAWN)
    const twr = getStructsByType(STRUCTURE_TOWER)
    const bld = _(data.sites).map(siteNrg).flatten().value()
    const con = room.controller && room.controller.my ? contNrg(room.controller) : []
    const cap = _(data.structures).filter(s => criteria.isOtherStruct(s) && criteria.isEnergyUser(s))
                                  .sortBy(order.byFreeCapacity)
                                  .value()
    
    // TODO: trm
    const trm = room.terminal && room.terminal.my ? [room.terminal] : []
    const wll = _(data.structures).filter({structureType:STRUCTURE_WALL})
                                  .map(wall => getCreepsByTarget(ROLE_WORKER, wall.id))
                                  .flatten()
                                  .value()
    const rmp = _(data.structures).filter({structureType:STRUCTURE_RAMPART})
                                  .map(rmp => getCreepsByTarget(ROLE_WORKER, rmp.id))
                                  .flatten()
                                  .value()
    const nkr = _.filter(data.structures, {structureType:STRUCTURE_NUKER})
    const str = room.storage && room.storage.my ? [room.storage] : []
    const src = _(data.sources).map(sourceNrg).flatten().value()
    const nrg = _(data.resources).filter(res => res.resourceType === RESOURCE_ENERGY)
                                 .filter(res => !_.some(data.sources, s => s.pos.isNearTo(res.pos)))
                                 .sortBy(order.byAmount)
                                 .value()

    function makePriority(level, objects)
    {
        return {level:level, objects:objects}
    }

    const from = [
        // makePriority(0, ext),
        // makePriority(1, spn),
        // makePriority(2, twr),
        makePriority(3, bld),
        makePriority(4, con),
        makePriority(5, cap),
        makePriority(6, trm),
        // makePriority(7, wll),
        // makePriority(8, rmp),
        // makePriority(9, nkr),
        makePriority(10, str),
        makePriority(11, src),
        makePriority(12, nrg),
    ]

    const to = [
        makePriority(0, ext),
        makePriority(1, spn),
        makePriority(2, twr),
        makePriority(3, bld),
        makePriority(4, con),
        makePriority(5, cap),
        makePriority(6, trm),
        makePriority(7, wll),
        makePriority(8, rmp),
        makePriority(9, nkr),
        // makePriority(10, str),
        // makePriority(11, src),
        // makePriority(12, nrg)
    ]

    return [from, to]
}

function route(priorities, haulers)
{
    const haulersByTarget = _.groupBy(haulers, 'memory.targetId')

    let fromIdx = _.size(priorities) - 1
    let toIdx = 0

    while(toIdx < fromIdx)
    {
        const fromPriority = priorities[fromIdx]
        if(fromPriority.from)
        {
            const sources = _.map(fromPriority.objects, s => ({src:s, haulers:_.get(haulersByTarget, source.id, [])}))
        }
    }
}
