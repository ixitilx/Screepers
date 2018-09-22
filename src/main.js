'use strict';

console.log(`Reinitialized at ${Game.time}. Hello!`);

require('prototype.room');
// require('prototype.source');
// require('prototype.spawn');
// require('prototype.creep');
// require('prototype.resource');
require('map.room');

const {RoomPlan} = require('plan.room');

exports.loop = function() {
    _.each(Game.rooms, room => new RoomPlan(room));
};
