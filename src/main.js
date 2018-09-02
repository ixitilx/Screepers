'use strict';

console.log(`Reinitialized at ${Game.time}`);

require('prototype.room');
require('prototype.source');
require('prototype.spawn');
require('prototype.creep');
require('prototype.resource');

const SourceManager = require('manager.source');

const {reset, measure, printReport} = require('cpu');

exports.loop = function() {
    reset();
    measure('loop', function() {
        _.each(Game.spawns, s => s.drawSpots());
        _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();
    });
    printReport();
};
