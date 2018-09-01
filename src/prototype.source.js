'use strict';

const { defineProperty } = require('utils.prototype');

function findSpots() {
    // console.log(`in findSpots(${this})`);
    const pos = this.pos;
    const room = this.room;
    const terra = room.lookForAtArea(
                    LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
    return _(terra).filter(t => t.terrain === 'plain' || t.terrain === 'swamp')
                   .map(t => new RoomPosition(t.x, t.y, room.name))
                   .value();
};

function containerSpot() {
    if (this.memory.containerSpot) {
        return new RoomPosition(
            this.memory.containerSpot.x,
            this.memory.containerSpot.y,
            this.room.name);
    }
    const spawn = Game.spawns.Spawn1;
    const spots = this.spots;
    const path = PathFinder.search(spawn.pos, this.spots, {plainCost:2, maxRooms:1});
    if (path.incomplete) {
        throw new Error(`Cannot find complete path from ${spawn} to ${this.spots}`);
    }

    // this.room.visual.poly(path.path);
    const spot = _.last(path.path);
    this.memory.containerSpot = {x: spot.x, y: spot.y};
    return spot;
};

function getContainer() {
    const containers = _.filter(Game.structures, {structureType: STRUCTURE_CONTAINER, pos: this.containerSpot});
    if (_.size(containers) === 1)
        return _.first(containers);

    const sites = _.filter(Game.constructionSites, {structureType: STRUCTURE_CONTAINER, pos: this.containerSpot});
    if (_.size(sites) === 1)
        return _.first(sites);

    return null;
};

function getSourceMemory() {
    return _.get(Memory, `sources.${this.id}`, {});
};

function getHarvesters() {
    return _.filter(Game.creeps, c => c.memory.source === this.id);
};

function drawSpots() {
    const visual = this.room.visual;
    _.each(this.spots, pos => visual.circle(pos, {fill:'Yellow'}));
    visual.circle(this.containerSpot, {fill: 'Red'});
};

defineProperty(Source, 'memory', getSourceMemory);
defineProperty(Source, 'spots', findSpots);
defineProperty(Source, 'harvesters', getHarvesters);
defineProperty(Source, 'containerSpot', containerSpot);
defineProperty(Source, 'container', getContainer);
Source.prototype.drawSpots = drawSpots;
