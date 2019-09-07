'use strict';

const {ScoreMap} = require('map.score');
const {posToIdx, floodFill} = require('map.room');
const {TerrainMap} = require('map.terrain');

function buildDistanceMapData(terrainMap, positions) {
    if (!_.isArray(positions) && positions.x && positions.y)
        positions = [positions];

    if (positions.length === 0)
        throw new Error('Cannot build distance map out of empty input');

    const data = Array.from({length: 2500}, v => null);

    let score = 0;
    const idx = positions.map(p => posToIdx(p.x, p.y));

    const callback = idx => {
        if (score)
            idx.forEach(i => data[i] = score);
        score += 1;
    };

    floodFill(idx, idx => _.inRange(idx, 0, 2500) && terrainMap.getIdx(idx) !== '#', callback);

    return data;
};

class DistanceMap extends ScoreMap {
    constructor(terrainMap, positions) {
        if (terrainMap && positions) {
            if (terrainMap instanceof TerrainMap)
                super(buildDistanceMapData(terrainMap, positions));
            else
                throw new Error(`Cannot initialize from ${terrainMap} and ${positions}`);
        } else {
            super(terrainMap);
        }
    };
};

module.exports = {
    DistanceMap: DistanceMap,
};
