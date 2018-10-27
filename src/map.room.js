'use strict';

const {createArray} = require('utils.prototype');

function inRoom(x, y) {
    return _.inRange(x, 0, 50) && _.inRange(y, 0, 50);
};

function inBuildingRange(x, y) {
    return _.inRange(x, 1, 49) && _.inRange(y, 1, 49);
};

function posToIdx(x, y) {
    if (!Number.isInteger(x) || !Number.isInteger(y))
        throw new Error(`Attempt to compute index from non-integer coordinates (${x}, ${y})`);
    return 50*y + x;
};

function idxToPos(idx) {
    if (!Number.isInteger(idx))
        throw new Error(`Attempt to compute coordinates from non-integer index [${idx}]`);
    return [idx%50, (idx/50)>>0];
};

const _nearIdx = [-51, -50, -49, -1, 1, 49, 50, 51];

function floodFillIdxStep(idx, visited, filter) {
    const wave = [];
    _nearIdx.forEach(di => {
        const newIdx = idx + di;
        if (!visited.has(newIdx) && filter(newIdx)) {
            visited.add(newIdx);
            wave.push(newIdx);
        }
    });
    return wave;
};

function floodFillStep(wave, visited, filter) {
    return _(wave).map(idx => floodFillIdxStep(idx, visited, filter))
                  .flatten()
                  .value();
};


function floodFill(idxArray, filter, waveCallback) {
    const visited = new Set(idxArray);
    for (let wave = idxArray; wave.length; wave = floodFillStep(wave, visited, filter)) {
        if (waveCallback)
            waveCallback(nextWave);
    }
    return Array.from(visited);
};

class RoomMap {
    constructor(data) {
        if (data instanceof RoomMap) {
            this.data = data.data.slice(0, data.data.length);
        } else if (data && data.length && data.length === 2500) {
            this.data = data;
        } else if (data && data.value) {
            this.data = createArray(data.value, [2500]);
        } else {
            throw new Error(`Cannot initialize from ${data}`);
        }
    };

    validatePos(x, y) {
        if (!inRoom(x) || !inRoom(y))
            throw new Error(`Position is outside of the room: [${x} ${y}]`);
    };

    validateIdx(idx) {
        if (!inRange(idx, 0, 2500))
            throw new Error(`Index is outside of the room: [${idx}]`);
    };

    _values() {
        return this.data.filter(v => v !== null);
    };

    setPos(x, y, value) {
        this.data[posToIdx(x, y)] = value;
    };

    getPos(x, y) {
        return this.data[posToIdx(x, y)];
    };

    getIdx(idx) {
        return this.data[idx];
    };

    map(func) {
        return new this.constructor(
            this.data.map(func));
    };

    mapNonNull(func) {
        return this.map(
            (v, ...args) => v === null ? v : func(v, ...args));
    };

    _filterFunc(func) {
        return this.map(
            (v, ...args) => v !== null && func(v, ...args) ? v : null);
    };

    _filterMap(roomMap) {
        return this.map((v, i) => roomMap.data[i] === null ? null : v);
    };

    filter(pred) {
        if (typeof(pred) === 'function')
            return this._filterFunc(pred);
        if (pred instanceof RoomMap)
            return this._filterMap(pred);
    };

    toString() {
        return this.constructor.name;
    };

    static combine(maps, func) {
        const mapData = maps.map(m => m.data);
        const zipData = _.zip(...mapData);
        const data = zipData.map(func);
        return new this(data);
    };

    static combineNotNull(maps, func) {
        return this.combine(maps, args => {
            return (_.any(args, _.isNull)) ? null : func(args);
        });
    };

    static combineAdd(maps) {
        return this.combineNotNull(maps, _.sum);
    };
};

module.exports = {
    RoomMap: RoomMap,
    inRoom : inRoom,
    inBuildingRange: inBuildingRange,
    posToIdx: posToIdx,
    idxToPos: idxToPos,
    floodFill: floodFill,
    floodFillStep: floodFillStep,
    floodFillIdxStep: floodFillIdxStep,
};
