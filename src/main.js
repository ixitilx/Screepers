require('task.dungeon.run');
const Task = require('Task');
const source_manager = require('source_manager');

exports.loop = function() {
    _(Game.rooms).map(r => r.find(FIND_SOURCES))
                 .flatten()
                 .each(s => source_manager.analyze(s))
                 .value();

    const t = Task.makeTask('task.dungeon.run', 'init', {});
    t.run();

    console.log(Game.time);
};
