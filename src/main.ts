import 'proto/roomobject'
import 'proto/roomposition'
import 'proto/room'

// const assert = require('assert')
// import {constants} from './constants'
// const layout = require('build_layout')
import * as roomManager from './manager/room'
import * as roomManager1 from './manager/room1'

// class StateTransition {
//     constructor(currentState:any, transitionHash:any) {
//         this.currentState = currentState
//         this.transitionHash = transitionHash
//     }
// }

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
