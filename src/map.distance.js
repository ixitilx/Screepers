'use strict';

const {ScoreMap} = require('map.score');
const {posToIdx, inRoom} = require('map.room');
const {TerrainMap} = require('map.terrain');

function posAround(p, pos) {
    const out = [];
    [-1, 0, 1].forEach(dy =>
        [-1, 0, 1].forEach(function(dx) {
            const pt = {x: p.x + dx, y: p.y + dy};
            if (inRoom(pt) && pos[pt.y][pt.x]===false) {
                out.push(pt);
                pos[pt.y][pt.x] = true;
            }
        }));
    return out;
};

function addNearby(x, y, i, data, out, terrainMap) {
    const checkAndAdd = function(x, y) {
        if (!inRoom(x, y))
            return;

        const i = posToIdx(x, y);
        if (!(i in out) && data[i]===null && terrainMap.getIdx(i) !== '#')
            out[i] = [x, y];
    };

    checkAndAdd(x-1, y-1);
    checkAndAdd(x  , y-1);
    checkAndAdd(x+1, y-1);
    checkAndAdd(x-1, y  );
    checkAndAdd(x+1, y  );
    checkAndAdd(x-1, y+1);
    checkAndAdd(x  , y+1);
    checkAndAdd(x+1, y+1);
};

function newQueue(queue, data, terrainMap) {
    const out = {};
    _.each(queue, ([x, y], i) => addNearby(x, y, i, data, out, terrainMap));
    return out;
};

function buildDistanceMapData(terrainMap, positions) {
    if (!_.isArray(positions) && positions.x && positions.y)
        positions = [positions];

    let queue = {};
    positions.forEach(p => queue[posToIdx(p.x, p.y)] = [p.x, p.y]);
    const data = Array.from({length: 2500}, v => null);

    let score;
    for (score = 0; _.size(queue); score++) {
        // set score for each passable tile in queue
        _.each(queue, ([x, y], i) => {
            if (terrainMap.getIdx(i) !== '#') {
                if (!_.inRange(i, 0, 2500))
                    throw new Error(`Attempt to set index ${i} (${x}, ${y})`);
                data[i] = score;
            }
        });

        queue = newQueue(queue, data, terrainMap);
    };

    if (data.length !== 2500)
        throw new Error(`Constructed corrupted data (length: ${data.length})`);

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
