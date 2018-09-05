'use strict';

// const { defineProperty } = require('utils.prototype');

function mapTerrain(terrain) {
    switch(terrain) {
        case 'wall' : return '#';
        case 'plain': return ' ';
        case 'swamp': return '*';
        default: throw new Error(`Unknown terrain type: ${terrain}`);
    };
};


function scanTerrain(terrainMapper=mapTerrain) {
    const room = this;
    return Array.from({length: 50}, (v, i) => {
        return room.lookForAtArea(LOOK_TERRAIN, i, 0, i, 49, true)
                   .map(rec => terrainMapper(rec.terrain))
                   .join('');
    });
};

Room.prototype.scanTerrain = scanTerrain;
