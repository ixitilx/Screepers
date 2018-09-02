'use strict';

console.log(`Reinitialized at ${Game.time}`);

require('prototype.room');
require('prototype.source');
require('prototype.spawn');
require('prototype.creep');
require('prototype.resource');

const SourceManager = require('manager.source');

exports.loop = function() {
    _.each(Game.spawns, s => s.drawSpots());
    _(Game.rooms).map(r => r.sources).flatten().each(SourceManager).value();

    const cpu = Game.cpu.getUsed();
    _.times(100, Game.cpu.getUsed);
    console.log('Game.cpu.getUsed(): ', 0.01 * Game.cpu.getUsed()-cpu);
};
