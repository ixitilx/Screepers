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
    _.each(Game.rooms, room => room.updateData());
    _.each(Game.rooms, room => new RoomPlan(room.name));
};
