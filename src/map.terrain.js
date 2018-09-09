'use strict';

const {posToIdx, idxToPos, RoomMap} = require('map.room');

const terrainMap = {
    'wall' : '#',
    'plain': ' ',
    'swamp': '*',
};

const terrainValues = _.values(terrainMap);

function isTerrainValue(value) {
    return terrainValues.indexOf(value) !== -1;
};

function mapTerrain(terrain) {
    const v = terrainMap[terrain];
    if (!v)
        throw new Error(`Unknown terrain type: ${terrain}`);
    return v;
};

function scanTerrain(room) {
    return room.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 49, true)
               .map(rec => mapTerrain(rec.terrain))
               .join('');
};

class TerrainMap extends RoomMap {
    constructor(data) {
        if (data instanceof Room) {
            super(scanTerrain(data));
        } else {
            super(data);
            if (!_.every(this.data, isTerrainValue))
                throw new Error(`Cannot initialize from ${data}`);
        }
    };

    _getExits(coordToIdx) {
        let prev = true;
        let exit = [];
        let out = [];
        for (let i=1; i<49; ++i) {
            const idx = coordToIdx(i);
            const curr = this.data[idx] === '#';

            if (curr && !prev) {
                out.push(exit);
                exit = [];
            }

            if (!curr) {
                const [x, y] = idxToPos(idx);
                exit.push({x:x, y:y});
            }

            prev = curr;
        }

        if (exit.length)
            out.push(exit);

        return out;
    };

    getLeftExits()   { return this._getExits(idx => posToIdx( 0, idx)); };
    getTopExits()    { return this._getExits(idx => posToIdx(idx,  0)); };
    getRightExits()  { return this._getExits(idx => posToIdx(49, idx)); };
    getBottomExits() { return this._getExits(idx => posToIdx(idx, 49)); };
    getAllExits()    { return [].concat(this.getTopExits(),
                                        this.getLeftExits(),
                                        this.getBottomExits(),
                                        this.getRightExits()); };
};

module.exports = {
    TerrainMap : TerrainMap
};
