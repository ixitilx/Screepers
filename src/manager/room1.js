'use strict';

// const lq = require('room_manager_logistics')
const assert = require('assert')
const source_manager = require('manager/source')
const BaseConstructionManager = require('manager/base_construction')
const ControllerUpgradeManager = require('manager/controller_upgrade')

exports.manage = manage

/*
    Objective:
        Construct base
        Upgrade controller
*/

class BaseManager {
    constructor(controller) {
        assert.Defined(controller);
        assert.InstanceOf(controller, StructureController);
        // assert.True(controller.my);

        this.controller = controller;
    }

    manage() {
        if(!this.controller.my)
            return
        BaseConstructionManager.manage(this.controller.room);
        ControllerUpgradeManager.manage(this.controller);
    }
}

// class ConstructionManager {
//     constructor(creepManager) {
//         this._creepManager = creepManager;
//         this.queue = [];
//         this.workers = [];
//     }

//     requestStructure(position, type) {
//     }
// }

// class CreepPoolManager {
//     constructor(baseManager) {
//         this._baseManager = baseManager;
//     }

//     requestCreep(requesterId, creepBody) {
//     }

//     releaseCreep(creep) {
//     }
// }

function manage(room, info) {
    // agenda:
    // - refill spawns
    // - build base
    // - upgrade controller
    // - harvest energy
    new BaseManager(room.controller).manage()

    updateRoomInfo(room, info)
    const sourceStatus = _.map(info.sources, s => ({obj: s, status: source_manager.manage.call(s)}))
    // console.log(JSON.stringify(sourceStatus, null, 2))
    drawRoads(room)
    // console.log(JSON.stringify(obj, null, 2))

    const harvesterBody = ['mcww', 'mw?', 'w?', 'mw?', 'w?']
    const haulerBody = 'mcc+'
    const workerBody = ['mcw','mww*','mw?']
}

function drawRoads(room)
{
    const spawns = room.find(FIND_STRUCTURES, {filter: {structureType:STRUCTURE_SPAWN}})
    const controller = room.controller
    const sources = room.find(FIND_SOURCES)
    const minerals = room.find(FIND_MINERALS)

    const roads = {}
    const roadMatrix = new PathFinder.CostMatrix()

    function callback(roomName)
    {
        if(!(roomName in Game.rooms))
            return false
        if(roomName === room.name)
            return roadMatrix
        return true
    }

    function newRoad(from, to, range)
    {
        assert.Equal(from.roomName, room.name)
        assert.Equal(to.roomName, room.name)

        const origin = from
        
        const goal = {
            pos:to,
            range:range
        }

        const opts = {
            roomCallback:callback,
            plainCost:2,
            swampCost:10
        }

        const ret = PathFinder.search(origin, goal, opts)
        const path = ret.path

        function updateRoad(pos)
        {
            const name = pos.serialize()
            if(name in roads)
                return
            roads[name] = {pos:pos, idx:_.size(roads)}
        }

        _.each(path, updateRoad)
        _.each(path, step => roadMatrix.set(step.x, step.y, 1))
    }

    _.each(spawns, spawn => newRoad(spawn.pos, controller.pos, 1))
    _.each(spawns, spawn => _.each(sources, source => newRoad(spawn.pos, source.pos, 1)))
    _.each(spawns, spawn => _.each(minerals, minerals => newRoad(spawn.pos, minerals.pos, 1)))
    _.each(roads, r => room.visual.circle(r.pos, {radius:0.1, fill:'#0080FF'}))

    // console.log(JSON.stringify(roadMatrix, null, 2))
}

// function findNearbyContainers(roomPosition)
// {
//     const structures = _.map(roomPosition.lookAround(LOOK_STRUCTURES), record => record.structure)
//     const containers = _.filter(structures, {my: true, structureType:STRUCTURE_CONTAINER})
//     return containers
// }

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

//
// what to spawn?
// creep requirement
//   haulers (not enough delivery power)
//   source harvesters (spots and work requirement)
//   workers (aim to finish construction/upgrade tasks for 500 ticks, has enough energy supply)
//   scouts
//

//
// what to build?
//   spawn/extension
//   tower
//   controller (link, container)
//   spawn (link, container)
//   source (link, container)
//   roads
//   ramparts/walls
//   other structures
//

const energyProviderPriorities = [
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
    STRUCTURE_TERMINAL,
    STRUCTURE_STORAGE
]

const energyConsumerPriorities = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,

    // construction_site
    // controller

    STRUCTURE_OBSERVER,
    STRUCTURE_TERMINAL,
    STRUCTURE_LAB,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_NUKER,

    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    
    // STRUCTURE_ROAD: "road",
    // STRUCTURE_WALL: "constructedWall",
    // STRUCTURE_RAMPART: "rampart",
    // STRUCTURE_KEEPER_LAIR: "keeperLair",
    // STRUCTURE_PORTAL: "portal",
    // STRUCTURE_EXTRACTOR: "extractor",
    // STRUCTURE_POWER_BANK: "powerBank",
    // STRUCTURE_CONTROLLER: "controller",
]

function updateRoomInfo(room, info)
{
    info.sources = room.find(FIND_SOURCES)
}
