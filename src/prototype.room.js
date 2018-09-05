'use strict';

const { defineProperty } = require('utils.prototype');

function findSources() {
    return this.find(FIND_SOURCES);
};

const defaultTerrainMap = {
    'wall' : '#',
    'plain': ' ',
    'swamp': '*',
};

function scanTerrain(terrainMap = terrain => defaultTerrainMap[terrain]) {
    const room = this;
    return Array.from({length: 50}, (v, i) => {
        return room.lookForAtArea(LOOK_TERRAIN, i, 0, i, 49, true)
                   .map(rec => terrainMap(rec.terrain))
                   .join('');
    });
};

defineProperty(Room, 'sources', _.memoize(findSources));
Room.prototype.scanTerrain = scanTerrain;
