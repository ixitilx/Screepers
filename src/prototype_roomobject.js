'use strict';

const logger = require('logger')

RoomObject.prototype.lookAround = function(lookFor, range=1)
{
	return this.room.lookForAtArea(
		lookFor,
		this.pos.y-range, this.pos.x-range,
		this.pos.y+range, this.pos.x+range,
		true)
}
