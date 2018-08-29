'use strict';

const { defineProperty } = require('utils.prototype');

function findSources() {
    return this.find(FIND_SOURCES);
};

defineProperty(Room, 'sources', findSources);
