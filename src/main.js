source_manager = require('source_manager')

exports.loop = function() {
    _(Game.rooms).map(r => r.find(FIND_SOURCES))
                 .flatten()
                 .each(s => source_manager.analyze(s))
    console.log(Game.time)
}
