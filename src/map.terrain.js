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

    _getExit(coordToIdx) {
        let out = [];
        for (let i=1; i<49; ++i) {
            const idx = coordToIdx(i);
            if (this.data[idx] === '#')
            {
                const [x, y] = idxToPos(idx);
                out.push({x:x, y:y});
            }
        }
        return out;
    };

    getLeftExit()   { return this._getExit(idx => posToIdx( 0, idx)); };
    getTopExit()    { return this._getExit(idx => posToIdx(idx,  0)); };
    getRightExit()  { return this._getExit(idx => posToIdx(49, idx)); };
    getBottomExit() { return this._getExit(idx => posToIdx(idx, 49)); };
    getAllExits()   { return [this.getTopExit(), this.getLeftExit(),
                              this.getBottomExit(), this.getRightExit()] };
};

module.exports = {
    TerrainMap : TerrainMap
};
