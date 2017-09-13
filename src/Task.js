'use strict';

const logger = require('logger')

//
// Achievable goal
// Can spans multiple ticks
// Ends with:
//      OK - goal reached
//      ERR_BUSY - in progress
//      ERR_* - can't complete because of *
// Example: move creep somewhere or haul resources
//
class Task {
    constructor() {
    }

    run(object) {
        return OK
    }
}

exports.Tasks = {Task: Task}

//
// Rooms
//      base     (claimed controller)
//      remote   (reserved controller)
//      neutral  (nothing here)
//
// RoomOwner
//      my
//      ally
//      neutral
//      enemy
//