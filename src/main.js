source_manager = require('source_manager')

var sources;

exports.loop = function() {
    if(sources) {
        console.log('I have sources: ' + sources)
    } else {
        console.log('I do not have sources. Creating some.')
        sources = _(Game.rooms).first().find(FIND_SOURCES)
    }
    _(Game.rooms).map(r => r.find(FIND_SOURCES))
                 .flatten()
                 .each(s => source_manager.analyze(s))
                 .value()

    console.log(Game.time)
}
