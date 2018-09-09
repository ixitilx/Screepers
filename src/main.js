'use strict';

console.log(`Reinitialized at ${Game.time}. Hello!`);

require('prototype.room');
// require('prototype.source');
// require('prototype.spawn');
// require('prototype.creep');
// require('prototype.resource');
require('map.room');
const drawSomething = require('prototype.room.plan.terrain');

// const SourceManager = require('manager.source');

// const {reset, measure, printReport} = require('cpu');

exports.loop = function() {
    // reset();
    // measure('loop', function() {
    //     _.each(Game.spawns, s => s.drawSpots());
    //     _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
    // });
    // printReport();

    _.each(Game.rooms, drawSomething);
};
