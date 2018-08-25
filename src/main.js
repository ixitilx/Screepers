'use strict';

require('task.dungeon.run');
const Task = require('Task');
const source_manager = require('source_manager');

const t = Task.makeTask('task.dungeon.run', 'init', {});

exports.loop = function() {
    _(Game.rooms).map(r => r.find(FIND_SOURCES))
                 .flatten()
                 .each(s => source_manager.analyze(s))
                 .value();

    t.run();

    console.log(Game.time);
};
