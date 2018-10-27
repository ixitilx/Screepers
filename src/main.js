'use strict';

const ident = require('ident');
console.log(`Reinitialized at ${Game.time}. Hello ${ident.me}!`);

require('prototype.room');
// require('prototype.source');
// require('prototype.spawn');
// require('prototype.creep');
// require('prototype.resource');
require('map.room');

const {RoomPlan} = require('plan.room');

exports.loop = function() {
    if (Game.cpu.bucket < 2000) {
        console.log(`CPU Bucket = ${Game.cpu.bucket}, skipping turn`);
        return;
    }
    _.each(Game.rooms, room => room.updateData());
    _.each(Game.rooms, room => new RoomPlan(room.name));
};
