'use strict';

const assert = require('assert')

function getBaseRoom()
{
    if(_.any(Game.spawns, s => s.pos.roomName === this.name))
        return this
    throw new Error(`Cannot find base room of ${this}`)
}


Object.defineProperty(Room.prototype, 'baseRoom', {get: getBaseRoom})
// Room.prototype.getPathTo = getPathTo
