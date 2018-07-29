'use strict';

const event = require('event');
const dispatcher = require('dispatcher');

dispatcher.subscribe(event.room.onVisible, updateLastSeen);

function updateLastSeen(room) {
    room.memory._lastSeen = Game.time;
}
