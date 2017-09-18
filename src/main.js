'use strict';

require('proto_roomobject')
require('proto_roomposition')

const assert = require('assert')
const constants = require('constants')
const layout = require('build_layout')

function loop()
{
    // console.log(`#### ${Game.time}`)
    clearCreepMemory()

    assert.Equal(_.size(Game.rooms), 1)
    assert.Equal(_.size(Game.spawns), 1)

    const room  = _(Game.rooms).toArray().first()
    const spawn = _(Game.spawns).toArray().first()

    const sources = room.find(FIND_SOURCES)
    _.each(sources, s => sourceHarvest(room, s, spawn))
    controllerUpgrade(room, spawn)

    const harvesters = _.filter(Game.creeps, c => c.memory.role===ROLE_HARVESTER)
    _.each(harvesters, h => creepHarvest(h))
}

function clearCreepMemory()
{
    _(Memory.creeps).keys()
                    .filter(k => !(k in Game.creeps))
                    .map(k => delete Memory.creeps[k])
                    .value()
}

function sourceHarvest(room, source, spawn)
{
    assert.Equal(room.name, source.room.name)
    assert.Equal(room.name, spawn.room.name)

    const terrain = source.pos.lookAround(LOOK_TERRAIN)

    const spots = _(terrain).filter(t => t.terrain !== TERRAIN_WALL)
                            .map(t => new RoomPosition(t.x, t.y, room.name))
                            .value()

    // Find container spot
    // const spawnPath = room.findPath(source.pos, spawn.pos, {ignoreCreeps:true})
    // const toRoomPos = xy => new RoomPosition(xy.x, xy.y, room.name)
    // const containerPos = toRoomPos(_(spawnPath).first())
    // source.memory.containerPos = new RoomPosition(containerPos.x, containerPos.y, room.name)
    // console.log(source, containerPos)
    // if(containerPos)
    // {
    //     const containers = containerPos.lookFor(LOOK_STRUCTURES)
    //     if(_.size(containers)===0)
    //     {
    //         const sites = containerPos.lookFor(LOOK_CONSTRUCTION_SITES)
    //         if(_.size(sites)===0)
    //         {
    //             room.createConstructionSite(containerPos, STRUCTURE_CONTAINER)
    //         }
    //     }        
    // }

    // const container = containerPos.lookAround(FIND_STRUCTURES)

    // Spawn extra harvesters
    const harvesters = _.filter(Game.creeps, c => c.memory.role === ROLE_HARVESTER
                                               && c.memory.targetId === source.id)

    let workHas = _(harvesters).map(h => h.body)
                               .flatten()
                               .filter(part => part.type===WORK)
                               .size()

    let countHas = _.size(harvesters)
    const countMax = _.size(spots)
    const workMax = source.energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME)

    if(countHas < countMax && workHas < workMax && !spawn.spawning && _.isUndefined(spawn.queued))
    {
        console.log(source, `work: ${workHas}/${workMax}, count: ${countHas}/${countMax}`)
        function getHarvesterBody() { return [WORK, WORK, CARRY, MOVE] }
        function getHarvesterMemory(source) { return {role:ROLE_HARVESTER, targetId:source.id} }
        const body = getHarvesterBody()
        const memory = getHarvesterMemory(source)
        const ret = spawn.createCreep(body, null, memory)
        const formatRet = (ret) => typeof(ret)==='string' && Game.creeps[ret] ? Game.creeps[ret] : ret
        console.log(`${source}: spawn.createCreep(${body}) => ${formatRet(ret)}`)
        if(typeof(ret)==='string')
            spawn.queued = true
    }

    return true
}

function creepHarvest(creep)
{
    // harvest, attack, build, repair, dismantle, attackController, rangedHeal, heal
    // rangedAttack, rangedMassAttack, build, repair, rangedHeal
    // when total energy is not enough
    // upgradeController, build-or-repair, withdraw, transfer, drop

    const source = Game.getObjectById(creep.memory.targetId)

    const ret = creep.harvest(source)
    if(ret === OK)
        return

    if(ret === ERR_NOT_IN_RANGE)
        return creep.moveTo(source, {reusePath:5, serializeMemory:true})

    const sites = source.pos.lookAround(LOOK_CONSTRUCTION_SITES, 3)
    if(_.size(sites))
    {
        const toSite = r => r.constructionSite
        const site = toSite(_(sites).first())
        const energyNeedForBuild = BUILD_POWER * _(creep.body).map(part => part.type===WORK).sum()
        if(creep.carry[RESOURCE_ENERGY] >= energyNeedForBuild)
        {
            const ret = creep.build(site)
        }

        const resources = creep.pos.lookAround(LOOK_RESOURCES)
        if(_.size(resources))
        {
            const toResource = r => r.resource
            const res = toResource(_(resources).first())
            creep.pickup(res)
        }
    }
}

function roomBuild(room)
{
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES)
    if(_.size(sites) > 0)
        return

    const structures = room.find(FIND_MY_STRUCTURES)

    // build extensions
    const extensions = _.filter(structures, s => s.structureType === STRUCTURE_EXTENSION)
    const extensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level] - _.size(extensions)
    if(extensionCount > 0)
    {

    }



    // build structure priority
    // 1. extension
    // 2. tower
    // 3. storage
    // 4. controller container
    // 5. source containers

    // build container near spawn (mini-storage)
    if(room.controller && room.controller.my && room.controller.level < 4)
    {

    }
}

function controllerUpgrade(room, spawn)
{
    const controller = room.controller

    const isPassable = t => t.terrain !== TERRAIN_WALL
    const terrain = _.filter(controller.pos.lookAround(LOOK_TERRAIN, 3), isPassable)
    const terrainPos = _.map(terrain, t => new RoomPosition(t.x, t.y, room.name))
    _.each(terrainPos, t => t.score = _(terrainPos).filter(tt => t.isNearTo(tt)).size())

    const maxScore = _(terrainPos).map('score').max()
    const minScore = _(terrainPos).map('score').min()

    const weight = (s) => (s-minScore)/(maxScore-minScore)
    const pad2   = (s) => s.length===1 ? '0'+s : s
    const red    = (s) => pad2(Math.ceil(255*(1-weight(s))).toString(16))
    const green  = (s) => pad2(Math.ceil(255*weight(s)).toString(16))
    const color  = (s) => '#' + red(s) + green(s) + '00'
    _.each(terrainPos, t => controller.room.visual.circle(t.x, t.y, {fill:color(t.score)}))

    const contPos = _(terrainPos).filter(t => t.score === maxScore)
                                 .sortBy(t => room.findPath(t, spawn.pos, {ignoreCreeps:true}).length)
                                 .first()

    controller.room.visual.circle(contPos.x, contPos.y, {fill:'#00FF00', radius:0.3})

    const structures = contPos.lookFor(LOOK_STRUCTURES)
    if(_.size(structures)===0)
    {
        const sites = 0
    }

    // controller.memory.containerPos = _.pick(contPos, 'x', 'y', 'roomName')
    // console.log(JSON.stringify(controller.memory.containerPos))
}

exports.loop = loop
