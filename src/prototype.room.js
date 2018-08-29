'use strict';

const { defineProperty } = require('utils.prototype');

function findSources() {
    return this.find(FIND_SOURCES);
};

function findEnergy(type=RESOURCE_ENERGY) {
    const droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {resourceType:type});
    // _.each(droppedEnergy, e => console.log(e.pos, e.amount));

    const spawns = _.filter(Game.spawns, {room: {name: this.name}});
    // _.each(spawns, s => console.log(s.pos, s.energy - s.energyCapacity));
};

defineProperty(Room, 'sources', findSources);
Room.prototype.findEnergy = findEnergy;
