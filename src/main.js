'use strict';

require('init');

const dispatcher = require('dispatcher');
const event = require('event');
const base = require('base');

// const empire = require('empire');
// console.log(empire.memory);

exports.loop = function() {
    checkRespawn();
    updateRoomData();
    addBaseData();
    const rd = roomDelta();
    const cd = creepDelta();
    dispatcher.processEventQueue();
}

function checkRespawn() {
    function isRespawn() {
        return _.size(Game.creeps) === 0 &&
               _.size(Game.rooms) === 1 &&
               _.size(Game.spawns) === 1 &&
               _.size(Game.structures) === 2 &&
               _.size(Game.flags) === 0;
    }

    if(isRespawn())
        dispatcher.processEvent(event.game.onRespawn);
}

function organizeCollection(collection, roomNameProperty, collectionKey) {
    const itemsByRoom = _.groupBy(collection, roomNameProperty);
    _.each(_.keys(itemsByRoom), roomName => itemsByRoom[roomName] = _.groupBy(itemsByRoom[roomName], collectionKey));
    return itemsByRoom;
}

function updateRoomData() {
    const sites = organizeCollection(Game.constructionSites, 'pos.roomName', 'id');
    const creeps = organizeCollection(Game.creeps, 'pos.roomName', 'name');
    const flags = organizeCollection(Game.flags, 'pos.roomName', 'name');
    const spawns = organizeCollection(Game.spawns, 'pos.roomName', 'name');
    const structures = organizeCollection(Game.structures, 'pos.roomName', 'id');

    function pickRoomData(roomName) {
        return {
            constructionSites: _.get(sites, roomName, {}),
            creeps: _.get(creeps, roomName, {}),
            flags:  _.get(flags,  roomName, {}),
            spawns: _.get(spawns, roomName, {}),
            structures: _.get(structures, roomName, {})
        };
    }

    _.each(Game.rooms, room => room.my = pickRoomData(room.name));
}

function addBaseData() {
    Game.bases = _(Game.structures).filter({structureType:STRUCTURE_CONTROLLER, my:true})
                                   .map(c => new base.Base(c.room))
                                   .value();
}

function roomDelta() {
    const known = Memory.rooms;
    const visible = Game.rooms;

    const kMemo = _.keys(Memory.rooms);
    const kGame = _.keys(Game.rooms);

    const kDiscovered = _.difference(kGame, kMemo);
    const kHidden = _.difference(kMemo, kGame);
    const kOperational = _.intersection(kGame, kMemo);

    const kDisappeared = _.filter(kHidden, k => known[k]._lastSeen === Game.time-1);
    const kAppeared = _.filter(kOperational, k => known[k]._lastSeen < Game.time-1);

    const delta = {
        discovered:     _.pick(Game.rooms, kDiscovered),
        appeared:       _.pick(Game.rooms, kAppeared),
        disappeared:    _.pick(Memory.rooms, kDisappeared),
        hidden:         _.pick(Memory.rooms, kHidden),
        visible:        Game.rooms,
        known:          Memory.rooms
    };

    _.each(delta.discovered,  dispatcher.eventQueueSink(event.room.onDiscover));
    _.each(delta.appeared,    dispatcher.eventQueueSink(event.room.onAppear));
    _.each(delta.disappeared, dispatcher.eventQueueSink(event.room.onDisappear));
    _.each(delta.hidden,      dispatcher.eventQueueSink(event.room.onHidden));
    _.each(delta.visible,     dispatcher.eventQueueSink(event.room.onVisible));
    _.each(delta.known,       dispatcher.eventQueueSink(event.room.onKnown));

    // _.each(Game.rooms, room => room.memory._lastSeen = Game.time);

    return delta;
}

function creepDelta() {
    // assume all creeps are mine
    const alive = Game.creeps;
    const known = Memory.creeps;

    const kMemo = _.keys(Memory.creeps);
    const kGame = _.keys(Game.creeps);

    const kAmnesia = _.difference(kGame, kMemo);
    const kMissing = _.difference(kMemo, kGame);
    const kOk      = _.intersection(kGame, kMemo);

    const delta = {
        amnesia: _.pick(Game.creeps, kAmnesia),
        missing: _.pick(Memory.creeps, kMissing),
        ok: _.pick(Game.creeps, kOk)
    };

    _.each(delta.amnesia, dispatcher.eventQueueSink(event.creep.onAmnesia));
    _.each(delta.missing, dispatcher.eventQueueSink(event.creep.onDie));
    _.each(delta.ok,      dispatcher.eventQueueSink(event.creep.onOperational));

    // _.each(delta.missing, (mem, key) => delete Memory.creeps[key]);

    return delta;
}

// function displayRoomInfo(room) {
//     console.log(`Room ${room} info:`);
//     console.log(`Creeps: ${_.toArray(room.my.creeps)}`);
//     console.log(`Spawns: ${_.toArray(room.my.spawns)}`);
//     console.log(`Structures: ${_.toArray(room.my.structures)}`);
//     console.log(`Sites: ${_.toArray(room.my.constructionSites)}`);
//     console.log(`Flags: ${_.toArray(room.my.flags)}`);
// }

// dispatcher.subscribe(event.room.onVisible, displayRoomInfo);
