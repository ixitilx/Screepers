'use strict';

const assert = require('assert')
const constants = require('constants')

exports.manage = manage

const VERSION = 3

/*
    Objective:
        Request harvesters
        Request construction
        Provide resources
*/

function manage()
{
    assert.Defined(this)
    if(this.memory.version !== VERSION)
    {
        delete this.memory
        initialize.call(this)
    }

    const needMoreHarvesters = manageHarvest.call(this)
    const hasEnergy = manageHauling.call(this)
    // console.log(`${this}: ${hasEnergy}`)
    
    // const workers = _.filter(Game.creeps, {memory:{targetId:this.id, role:ROLE_WORKER}})

    // console.log(JSON.stringify(this.memory.spots, null, 2))

    draw.call(this)

    const needCreeps = []
    if(needMoreHarvesters)
        needCreeps.push(ROLE_HARVESTER)
    if(hasEnergy > 0)
        needCreeps.push(ROLE_HAULER)

    return {needCreeps:needCreeps, hasEnergy:hasEnergy}
}

function manageHauling()
{
    const haulers = _.filter(Game.creeps, {memory:{targetId:this.id, role:ROLE_HAULER}})
    const eDrops = _.filter(this.pos.lookAround(LOOK_RESOURCES), {resourceType:RESOURCE_ENERGY})
    const harvsOnPosition = _.filter(this.pos.lookAround(LOOK_CREEPS), {my:true, memory:{role:ROLE_HARVESTER}})
    const cont = this.memory.containerId && Game.getObjectById(this.memory.containerId)

    manageHaulers.call(this, haulers, eDrops, harvsOnPosition, cont)

    const eDropsEnergy = _(eDrops).map('amount').sum()
    const harvsEnergy = _(harvsOnPosition).map(h => h.carry[RESOURCE_ENERGY]).sum()
    const contEnergy = (cont && cont.store && cont.store[RESOURCE_ENERGY]) ? cont.store[RESOURCE_ENERGY] : 0
    const hasEnergyTotal = eDropsEnergy + harvsEnergy + contEnergy

    const toWithdrawTotal = _(haulers).map(h => h.carryCapacity - _.sum(h.carry)).sum()

    const hasEnergy = hasEnergyTotal - toWithdrawTotal
    return hasEnergy
}

function manageHaulers(haulers, eDrops, harvsOnPosition, cont)
{
    let eDropIdx = 0
    let harvIdx = 0
    let pickedUp = 0

    _.each(haulers, function(hauler) {
        while(pickedUp===0 && eDropIdx < _(eDrops).size())
        {
            const eDrop = eDrops[eDropIdx]
            if(hauler.pos.isNearTo(eDrop.pos))
            {
                const ret = hauler.pickup(eDrop)
                if(ret === OK)
                {
                    eDropIdx++
                    pickedUp = eDrop.amount
                    break
                }
                throw new Error(`${hauler}.pickup(${eDrop}) => ${ret}`)
            }
            else
            {
                hauler.moveTo(eDrop)
                return true
            }
        }

        while(pickedUp===0 && harvIdx < _(harvsOnPosition).size())
        {
            const harv = harvsOnPosition[harvIdx]
            if(_.sum(harv.carry) < harv.carryCapacity)
            {
                harvIdx ++
                continue
            }

            harv.transfer(hauler, RESOURCE_ENERGY)
            harvIdx++
            pickedUp = harv.carry[RESOURCE_ENERGY]
            break
        }

        if(pickedUp === 0 && cont)
        {
            const ret = hauler.withdraw(cont, RESOURCE_ENERGY)
            if(ret === OK)
                pickedUp = cont.store[RESOURCE_ENERGY]
        }

        if( (_.sum(hauler.carry) + pickedUp) >= hauler.carryCapacity)
            delete hauler.memory.targetId

        return true
    })
}

function manageHarvest()
{
    const spots = _.map(this.memory.spots, RoomPosition.deserialize)
    assert.Defined(spots)

    const harvs = _.filter(Game.creeps, {memory:{targetId:this.id, role:ROLE_HARVESTER}})
    const needWork = Math.ceil(this.energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME))
    const hasWork = _(harvs).map('body').flatten().filter(part => part === WORK).size()

    const harvCount = _.size(harvs)
    const spotCount = _.size(spots)

    const hsZip = _.take(_.zip(harvs, spots), Math.min(harvCount, spotCount))

    _.each(hsZip, ([harv, spot]) => manageHarvester.call(this, harv, spot))

    return hasWork < needWork && harvCount < spotCount
}

function manageHarvester(harv, spot)
{
    if(!harv.pos.isEqualTo(spot))
        harv.moveTo(spot)
    else
        harv.harvest(this)
}

function initialize()
{
    console.log(`Initializing ${this}`)
    initializeSpots.call(this)
    initializeContainerPos.call(this)
    initializeContainer.call(this)
    this.memory.version = VERSION
}

function initializeSpots()
{
    const spots = _(this.pos.lookAround(LOOK_TERRAIN))
                                .filter(t => t.terrain !== TERRAIN_WALL)
                                .map('pos').value()
    assert.True(_.size(spots)>0)
    this.memory.spots = spots
}

function initializeContainerPos()
{
    const spots = this.memory.spots

    const baseRoom = this.room.baseRoom
    const spawns = _.filter(Game.spawns, s => s.pos.roomName === baseRoom.name)
    assert.True(_.size(spawns)>0)

    const path = PathFinder.search(spawns[0].pos, spots[0]).path
    
    
    const isNearSpot = (pos) => _.any(spots, s => s.isNearTo(pos))
    const notNearSpotsIdx = _(path).findLastIndex(step => !isNearSpot(step))
    assert.True(notNearSpotsIdx !== -1)

    const containerPos = path[notNearSpotsIdx+1]
    this.memory.containerPos = containerPos

    _.each(spots, s => s.range = Math.abs(s.x-containerPos.x) + Math.abs(s.y-containerPos.y))
    _.sortBy(spots, 'range')
}

function initializeContainer()
{
    const structs = this.memory.containerPos.lookAround(LOOK_STRUCTURES, 0)
    const cont = _(structs).filter({structureType:STRUCTURE_CONTAINER}).first()
    if(cont)
        this.memory.containerId = cont.id

    const sites = this.memory.containerPos.lookAround(LOOK_CONSTRUCTION_SITES, 0)
    const site = _(sites).filter({my:true, structureType:STRUCTURE_CONTAINER}).first()
    if(site)
        this.memory.containerSiteId = site.id
}

function draw()
{
     _.each(this.memory.spots, s => this.room.visual.circle(s.x, s.y, {fill:'#00FF00'}))
    this.room.visual.circle(this.memory.containerPos, {fill:'#208020', radius:0.3})
}
