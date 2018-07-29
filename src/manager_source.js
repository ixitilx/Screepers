'use strict';

exports.manage = manage;

function manage(source) {
    source.draw();
}

function getMemory() {
    if(!this._memory) {
        if(!Memory.sources)
            Memory.sources = {};
        if(!Memory.sources[this.id])
            Memory.sources[this.id] = { _created: Game.time };
        this._memory = Memory.sources[this.id];
        this._memory._accessed = Game.time;
    }
    return this._memory;
}

function findHarvesterPos(pos) {
    const room = Game.rooms[pos.roomName];
    if(!room)
        throw new Error(`Room ${pos.roomName} is not visible`);
    
    const terra = room.lookForAtArea(LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
    return _(terra).filter(t => t.terrain !== 'wall')
                   .map(t => new RoomPosition(t.x, t.y, pos.roomName))
                   .value();
}

function getHarvesterPos() {
    if(!this._harvesterPos) {
        if(!this.memory.harvesterPos)
            this.memory.harvesterPos = findHarvesterPos(this.pos);
        this._harvesterPos = _.map(this.memory.harvesterPos, p => new RoomPosition(p.x, p.y, p.roomName));
    }
    return this._harvesterPos;
}

function findContainerPos(source) {
    // _.min(source.harvesterPos, p => source.room.baseRoom.basePosition);
    return source.harvesterPos[0];
}

function getContainerPos() {
    if(!this._containerPos) {
        if(!this.memory.containerPos)
            this.memory.containerPos = findContainerPos(this);
        this._containerPos = new RoomPosition(
            this.memory.containerPos.x,
            this.memory.containerPos.y,
            this.memory.containerPos.roomName);
    }
    return this._containerPos;
}

function draw() {
    _.each(this.harvesterPos, function(p) { this.room.visual.circle(p); }, this);
    this.room.visual.circle(this.containerPos, {radius:0.3, fill:undefined, stroke: '#ffffff'});
}

Object.defineProperty(Source.prototype, 'memory',       {get: getMemory});
Object.defineProperty(Source.prototype, 'harvesterPos', {get: getHarvesterPos});
Object.defineProperty(Source.prototype, 'containerPos', {get: getContainerPos});
Object.defineProperty(Source.prototype, 'draw',         {value: draw});
