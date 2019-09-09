'use strict';

require('prototype.source');
const sourceManager = require('manager.source.2');

const ident = require('ident');
console.log(`Reinitialized at ${Game.time}. Hello ${ident.me}!`);

exports.loop = function() {
    _(Game.rooms)
        .map(room => room.find(FIND_SOURCES))
        .flatten()
        .each(source => sourceManager(source))
        .value();
};
