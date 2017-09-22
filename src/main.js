'use strict';

require('proto_roomobject')
require('proto_roomposition')
require('proto_room')

// const assert = require('assert')
const constants = require('constants')
// const layout = require('build_layout')
const roomManager = require('room_manager')
const roomManager1 = require('room_manager_1')

class StateTransition {
    constructor(currentState, transitionHash) {
        this.currentState = currentState
        this.transitionHash = transitionHash
    }
}

function loop()
{
    // console.log(`#### ${Game.time}`)
    clearCreepMemory()

    const roomInfo = collectRoomInfo()
    _.each(Game.rooms, room => roomManager .manage(room, roomInfo[room.name]))
    _.each(Game.rooms, room => roomManager1.manage(room, roomInfo[room.name]))
}

function collectRoomInfo()
{
    const roomInfo = _.reduce(Game.rooms, function(acc, room) {
        acc[room.name] = {
            constructionSites:[],
            structures:[],
            creeps:[],
            spawns:[]}
        return acc
    }, {})

    function extractRoomInfo(prop)
    {
        const byRoom = _.groupBy(Game[prop], 'pos.roomName')
        _.each(byRoom, (collection, roomName) => _.set(roomInfo, [roomName, prop], collection))
    }

    extractRoomInfo('constructionSites')
    extractRoomInfo('structures')
    extractRoomInfo('creeps')
    extractRoomInfo('spawns')

    return roomInfo
}

function clearCreepMemory()
{
    _(Memory.creeps).keys()
                    .filter(k => !(k in Game.creeps))
                    .map(k => delete Memory.creeps[k])
                    .value()
}

exports.loop = loop
