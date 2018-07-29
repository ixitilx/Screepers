'use strict';

exports.room = {
    onDiscover  : Symbol(), //room, roomName, discoveredRooms<name, room>
    onAppear    : Symbol(), //room, roomName, appearedRooms<name, room>
    onDisappear : Symbol(), //roomMemory, roomName, disappearedRooms<name, roomMemory>
    onVisible   : Symbol(), //room, roomName, visibleRooms<name, room>
    onHidden    : Symbol(), //roomMemory, roomName, hiddenRooms<name, roomMemory>
    onKnown     : Symbol()  //roomMemory, roomName, knownRooms<name, roomMemory>
};

exports.game = {
    onRespawn : Symbol()    //N/A
};

exports.creep = {
    onAmnesia : Symbol(),       // creep, creepName, creepsWithAmnesia<name, creep>
    onDie     : Symbol(),       // creepMemory, creepName, deadCreeps<name, creep>
    onOperational : Symbol(),   // creep, creepName, intactCreeps<name, creep>
};
