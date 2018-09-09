'use strict';

const {ColorMap} = require('map.color');
const {idxToPos} = require('map.room');

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

function drawColorMap(colorMap) {
    if (!(colorMap instanceof ColorMap))
        throw new Error(`Not a color map: ${colorMap}`);

    colorMap.data.forEach((c, i) => {
        if (c) {
            const [x, y] = idxToPos(i);
            this.visual.circle(x, y, {fill:c});
        }
    });
};

Room.prototype.scanTerrain = scanTerrain;
Room.prototype.drawColorMap = drawColorMap;
