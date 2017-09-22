'use strict';

const assert = require('assert')

exports.find = find

function find(fromPos, toPos)
{
    assert.Type(fromPos, RoomPosition)
    assert.Type(toPos, RoomPosition)

    if(fromPos.isSame(toPos))
        return []

    const cached = lookUpCachedPath(fromPos, toPos)
    if(cached)
        return cached

    const isPassable = toPos.lookAround(LOOK_TERRAIN, 0)[0].terrain !== TERRAIN_WALL

    if(!isPassable)
        assert.True(_.any(toPos.lookAround(LOOK_TERRAIN), t => t.terrain !== TERRAIN_WALL))

    const origin = fromPos

    const goal = {
        pos:toPos,
        range: isPassable ? 0 : 1
    }

    const opts = {
        roomCallback:roomRoadsCallBack,
        plainCost:2,
        swampCost:10
    }

    const ret = PathFinder.search(origin, goal, opts)
    assert.True(!ret.incomplete)
    return ret.path
}

function getBaseRoom()
{
    if(_.any(Game.spawns, s => s.pos.roomName === this.name))
        return this
    throw new Error(`Cannot find base room of ${this}`)
}

const roadMatrixCache = undefined
const roadMatrixTick = undefined

function buildRoadMatrix(roomName)
{
    const mtx = new PathFinder.CostMatrix()
    const roomMemory = Memory.rooms[roomName]
    if(roomMemory)
    {
        const roads = _.get(roomMemory, 'roads', [])
        const roomRoads = _.filter(roomMemory.roads, {roomName:roomName})
        _.each(roomRoads, r => mtx.set(r.x, r.y, 1))
        roadMatrixCache[roomName] = mtx
    }
    return mtx
}

function roomRoadsCallBack(roomName)
{
    if(roadMatrixTick !== Game.time)
        roadMatrixCache = {}

    if(!(roomName in roadMatrixCache))
        roadMatrixCache[roomName] = buildRoadMatrix(roomName)

    return roadMatrixCache[roomName]
}

const PATHCACHE_DEPRECATE = 100
const pathCache = {}

function lookUpCachedPath(fromPos, toPos)
{
    const from = fromPos.serialize()
    const to = toPos.serialize()

    const key = from + ';' + to
    if(key in pathCache)
        return pathCache[key].path

    const reversedKey = from + ';' + to
    if(reversedKey in pathCache)
        return pathCache[reversedKey].path.slice().reverse()

    return null
}

function registerPath(fromPos, toPos, path)
{
    const from = fromPos.serialize()
    const to = toPos.serialize()

    if(to >= from)
        pathCache[from + ';' + to] = {path:path, ts:Game.time}
    else
        pathCache[to + ';' + from] = {path:path.slice().reverse(), ts:Game.time}
}


