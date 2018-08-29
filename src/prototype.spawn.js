'use strict';

const { defineProperty } = require('utils.prototype');

function findSpawnSpots() {
    const p = this.pos;
    const sides = [
        new RoomPosition(p.x-1, p.y, p.roomName),
        new RoomPosition(p.x+1, p.y, p.roomName),
        new RoomPosition(p.x, p.y-1, p.roomName),
        new RoomPosition(p.x, p.y+1, p.roomName)];
    return _.filter(sides, p => p.lookFor(LOOK_TERRAIN) !== 'wall');
};

function drawSpots() {
    _.each(this.spots, p => this.room.visual.circle(p, {fill: 'Red'}));
};

function getEnergyLevel() {
    return energy - energyCapacity;
};

defineProperty(StructureSpawn, 'spots', findSpawnSpots);
defineProperty(StructureSpawn, 'energyLevel', getEnergyLevel);
StructureSpawn.prototype.drawSpots = drawSpots;
