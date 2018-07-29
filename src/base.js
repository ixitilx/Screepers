'use strict';

function Base(room) {
    this.baseRoom = room;
    this.memory;
};

function baseMemoryInit(base) {
    const room = base.baseRoom;

    return {
        _created: Game.time,
        rooms: [room.name]
    };
}

function baseInit(base) {
    const room = base.baseRoom;

    base.addManagedGameObject(room.controller);
    _.each(room.find(FIND_SOURCES), base.addManagedGameObject, base);
    _.each(room.find(FIND_MINERALS), base.addManagedGameObject, base);
}

function getMemory() {
    if(!this._memory) {
        if(!Memory.bases)
            Memory.bases = {};
        if(!Memory.bases[this.baseRoom.name]) {
            Memory.bases[this.baseRoom.name] = baseMemoryInit(this);
            baseInit(this);
        }
        this._memory = Memory.bases[this.baseRoom.name];
        this._memory._accessed = Game.time;
    }
    return this._memory;
}

function getRooms() {
    if(!this._rooms)
        this._rooms = _.pick(Game.rooms, this.memory.rooms);
    return this._rooms;
}

function getController() {
    return this.baseRoom.controller;
}

function getStorage() {
    if(this.baseRoom.storage)
        return this.baseRoom.storage;

    if(!this._storage) {
        if(this.memory.storageCont) {
            this._storage = Game.getObjectById(this.memory.storageCont);
        } else {
            if(!this.memory.storagePos) {
               this.memory.storagePos = findStoragePos(this.controller);
            }
            const {x, y, roomName} = this.memory.storagePos;
            this._storage = new RoomPosition(x, y, roomName);
        }
    }
    return this._storage;
}

function addManagedGameObject(gameObject) {
    const id = gameObject.id;
    const pos = gameObject.pos;
    console.log(`Adding ${gameObject} to ${this}`);
}

Object.defineProperty(Base.prototype, 'memory', {get: getMemory});
Object.defineProperty(Base.prototype, 'rooms',  {get: getRooms});
Object.defineProperty(Base.prototype, 'controller', {get: getController});
Object.defineProperty(Base.prototype, 'storage', {get: getStorage});

Base.prototype.addManagedGameObject = addManagedGameObject;

exports.Base = Base;
