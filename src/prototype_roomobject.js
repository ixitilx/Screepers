'use strict';

const logger = require('logger')
const Screeps = require('screeps')

RoomObject.prototype.lookAround = function(lookFor, range=1)
{
	return this.room.lookForAtArea(
		lookFor,
		this.pos.y-range, this.pos.x-range,
		this.pos.y+range, this.pos.x+range,
		true)
}

function makeLookAroundFunction(lookFor, subFieldName)
{
	return function()
	{
		return _(this.lookAround(lookFor)).map(i => i[subFieldName]).value()
	}
}

function getContainersAround()
{
	return _.filter(this.structuresAround, {structureType:STRUCTURE_CONTAINER})
}

Screeps.newTickProperty(RoomObject, makeLookAroundFunction(LOOK_CREEPS,     'creep'    ), 'creepsAround')
Screeps.newTickProperty(RoomObject, makeLookAroundFunction(LOOK_STRUCTURES, 'structure'), 'structuresAround')
Screeps.newTickProperty(RoomObject, makeLookAroundFunction(LOOK_RESOURCES,  'resource' ), 'resourcesAround')
Screeps.newTickProperty(RoomObject, makeLookAroundFunction(LOOK_SOURCES,    'source'   ), 'sourcesAround')
Screeps.newTickProperty(RoomObject, getContainersAround, 'containersAround')
