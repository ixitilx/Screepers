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

    const roomInfo:any = collectRoomInfo()
    _.each(Game.rooms, room => roomManager .manage(room, roomInfo[room.name]))
    _.each(Game.rooms, room => roomManager1.manage(room, roomInfo[room.name]))
}

function collectRoomInfo()
{
    const roomInfo = _.reduce(Game.rooms, function(acc:any, room) {
        acc[room.name] = {
            constructionSites:[],
            structures:[],
            creeps:[],
            spawns:[]}
        return acc
    }, {})

    function extractRoomInfo(collection:any, prop:string)
    {
        const byRoom = _.groupBy(collection, 'pos.roomName')
        _.each(byRoom, (collection, roomName) => _.set(roomInfo, [roomName, prop], collection))
    }

    extractRoomInfo(Game.constructionSites, 'constructionSites')
    extractRoomInfo(Game.structures, 'structures')
    extractRoomInfo(Game.creeps, 'creeps')
    extractRoomInfo(Game.spawns, 'spawns')

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
