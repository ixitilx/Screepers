'use strict';

const event = require('event');
const dispatcher = require('dispatcher');

dispatcher.subscribe(event.game.onRespawn, wipeMemory)

function wipeMemory() {
    for(const name in Memory) {
        delete Memory[name];
    }

    Memory._respawned = Game.time;

    console.log(`Respawned at ${Game.time}`);
}
