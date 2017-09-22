'use strict';

// const lq = require('room_manager_logistics')
const assert = require('assert')

const buildPriority = [
    // STRUCTURE_RAMPART,
    // STRUCTURE_WALL,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_SPAWN,
    // STRUCTURE_ROAD,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    // STRUCTURE_CONTAINER,
    STRUCTURE_NUKER
]

const rampartCoverage = [
    STRUCTURE_TOWER,
    STRUCTURE_STORAGE,
    STRUCTURE_SPAWN,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_TERMINAL,
    STRUCTURE_NUKER
]

/*
    Objective:
        Construct base
*/

function manage(room) {
    // what to build?
    if (_.isUndefined(room.memory.constructionQueue) ||
        _.isUndefined(room.memory.constructionQueue.rcl) ||
        room.controller.level > room.memory.constructionQueue.rcl)
    {
        const myRoomStructures = room.find(FIND_MY_STRUCTURES);
        const myRoomStructuresByType = _.countBy(myRoomStructures, 'structureType');
        const pendingStructures = getPendingStructures(room.controller.level, myRoomStructuresByType);
        room.memory.constructionQueue = {
            rcl: room.controller.level,
            queue: prioritizePendingStructures(pendingStructures)
        };
    }
    // console.log(JSON.stringify(constructionQueue))

    // where to build?
    return _.size(room.memory.constructionQueue.queue) > 0 ? ERR_INVALID_ARGS : OK
}

function getPendingStructures(rcl, structureCountByType) {
    const todoCountByType = _(CONTROLLER_STRUCTURES).map( (countByRcl, structureType) => ({type:structureType, count:countByRcl[rcl]}) )
                                                    .map( req => ({type:req.type, count:req.count - _.get(structureCountByType, req.type, 0)}) )
                                                    .filter( req => req.count > 0)
                                                    .value();
    return todoCountByType;
}

function prioritizePendingStructures(pendingStructures) {
    const prioritized = _(pendingStructures.slice())
                                .map(item => _.set(item, 'priority', buildPriority.indexOf(item.type)))
                                .filter(item => item.priority !== -1)
                                .sortBy('priority')
                                .value();
    return prioritized;
}

exports.manage = manage
