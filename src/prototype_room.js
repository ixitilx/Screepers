'use strict';

const logger = require('logger')

Room.prototype.manage = function()
{
    _.each(this.sources, s => s.manage())
}

Object.defineProperty(Room.prototype, 'spawns',
{
    get: function() {
        return _(Game.spawns).filter(s => s.room.name===this.name)
                             .indexBy('name')
                             .value()
    },
    enumerable: false,
    configurable: true
})

Object.defineProperty(Room.prototype, 'sources',
{
    get: function() { return _.indexBy(this.find(FIND_SOURCES), 'id') },
    enumerable: false,
    configurable: true
})
