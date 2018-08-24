source_manager = require('source_manager');

require('StateMachine');
require('StateMachineRegistry');
require('StateMachineBuilder');
require('Task');

exports.loop = function() {
    _(Game.rooms).map(r => r.find(FIND_SOURCES))
                 .flatten()
                 .each(s => source_manager.analyze(s))
                 .value();

    console.log(Game.time);
}
