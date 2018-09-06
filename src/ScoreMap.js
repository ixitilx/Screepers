'use strict';

const {createArray} = require('utils.prototype');

class ScoreMap {
    constructor(data) {
        if (data===undefined)
            this.data = createArray(() => null, [50, 50]);
        else
            this.data = data;
    };

    _checkCoords(x, y) {
        if (x < 0 || 50 <= x || y < 0 || 50 <= y)
            throw new Error(`Point x=${x}, y=${y} is outside of the room`);
    };

    _values() {
        return [].concat(...this.data).filter(x => x !== null);
    };

    _minMax() {
        const v = this._values();
        if (v.length === 0)
            throw new Error('Cannot calculate minMax on empty ScoreMap');

        let min = v[0];
        let max = v[0];
        v.forEach(item => {
            min = Math.min(min, item);
            max = Math.max(max, item);
        });

        return {min:min, max:max};
    };

    set(x, y, value) {
        this._checkCoords(x, y);
        this.data[y][x] = value;
    };

    get(x, y) {
        this._checkCoords(x, y);
        return this.data[y][x];
    };

    clone() {
        return new ScoreMap(
            this.data.map(row => row.slice(0, row.length)));
    };

    update(func) {
        this.data.forEach(
            (row, y) => row.forEach(
                (value, x, arr) => arr[x] = func(value, x, y)));
        return this;
    };

    updateNonNull(func) {
        return this.update((v, x, y) => v === null ? v : func(v, x, y));
    };

    filter(func) {
        return this.updateNonNull((v, x, y) => func(v, x, y) ? v : null);
    };

    normalize() {
        const {min: minValue, max: maxValue} = this._minMax();
        const range = maxValue - minValue;
        if (range === 0)
            throw new Error(`Cannot normalize ScoreMap containing just one value: ${minValue}`);

        return this.updateNonNull((v, x, y) => (v-minValue)/range);
    };

    inverse() {
        const {min: minValue, max: maxValue} = this._minMax();
        return this.updateNonNull(v => minValue + maxValue - v);
    };

    toString() {
        return 'ImaScoreMap!';
    };

    static combine(func, ...maps) {
        return new ScoreMap().update(
            (v, x, y) => func(maps.map(mm => mm.get(x, y)), x, y));
    };
};

// function posAround(p, pos) {
//     const out = [];
//     const checkAndAdd = function(x, y) {
//         if(0 <= x && x < 50 && 0 <= y && y < 50 && pos[y][x]===false)
//             out.push({x:x, y:y});
//     };
//     checkAndAdd(p.x-1, p.y-1);
//     checkAndAdd(p.x-1, p.y  );
//     checkAndAdd(p.x-1, p.y+1);
//     checkAndAdd(p.x  , p.y-1);
//     checkAndAdd(p.x  , p.y+1);
//     checkAndAdd(p.x+1, p.y-1);
//     checkAndAdd(p.x+1, p.y  );
//     checkAndAdd(p.x+1, p.y+1);
//     return out;
// };

function isInRoom(p) {
    return (0 <= p.x && p.x < 50) && (0 <= p.y && p.y < 50);
};

function posAround(p, pos) {
    const out = [];
    [-1, 0, 1].forEach(dy =>
        [-1, 0, 1].forEach(function(dx) {
            const pt = {x: p.x + dx, y: p.y + dy};
            if (isInRoom(pt) && pos[pt.y][pt.x]===false) {
                out.push(pt);
                pos[pt.y][pt.x] = true;
            }
        }));
    return out;
};


function buildDistanceMap(positions, terrainMap) {
    if (!_.isArray(positions) && positions.x && positions.y)
        positions = [positions];

    const m = new ScoreMap();
    const pos = createArray(() => false, [50, 50]);
    
    let queue = positions.map(p => _.pick(p, ['x', 'y']));
    queue.forEach(p => pos[p.y][p.x] = true);

    let score;
    for (score = 0; queue.length > 0; score++) {
        queue.filter(p => terrainMap[p.y][p.x] !== '#')
             .forEach(p => m.set(p.x, p.y, score));

        queue = _(queue).map(p => posAround(p, pos)).flatten().value();
        queue = queue.filter(p => terrainMap[p.y][p.x] !== '#');
        queue = queue.filter(p => m.get(p.x, p.y) === null);
    };

    return m;
};

module.exports = {
    ScoreMap: ScoreMap,
    buildDistanceMap: buildDistanceMap,
};
