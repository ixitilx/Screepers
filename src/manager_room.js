'use strict';

const sourceManager = require('manager_source');

exports.manage = manage;

function manage(room) {
    if(room.controller && (
        room.controller.owner.username === SCREEPS_USERNAME || (
            room.controller.reservation.username === SCREEPS_USERNAME &&
            room.controller.reservation.ticksToEnd > 10) ) ) {
        _.each(room.find(FIND_SOURCES), s => sourceManager.manage(s));
    }
}

function getManagedObjects() {
    if(!this._managedObjects) {
        if(!this.memory.managedObjectIds)
            this.memory.managedObjectIds = [];//initManagedObjects(this);
        this._managedObjects = _.map(this.memory.managedObjectIds, Game.getObjectById);
    }

    return this._managedObjects;
}

Object.defineProperty(Room.prototype, 'managedObjects', getManagedObjects);


/*
    BaseRoom interface
*/
function addChildRoom(room) {
    if(this.baseRoomName !== this.name)
        throw new Error('Attempt to add child room to a non-base room');

    room.memory.baseRoomName = this.name;
    this.childRooms.push(room.name);
}

Object.defineProperty(Room.prototype, 'addChildRoom', addChildRoom);
