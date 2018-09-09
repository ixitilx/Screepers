'use strict';

const {createArray} = require('utils.prototype');
const {RoomMap} = require('map.room');

function isScore(value) {
    return value === null || _.isNumber(value);
};

class ScoreMap extends RoomMap {
    constructor(data) {
        super(data);
        if (!_.every(this.data, isScore))
            throw new Error(`Cannot initialize from ${data}`);
    };

    minMax() {
        const v = this._values();
        if (v.length === 0)
            throw new Error('Cannot calculate minMax on empty ScoreMap');
        return [Math.min(...v), Math.max(...v)];
    };

    normalize() {
        const [minValue, maxValue] = this.minMax();
        const range = maxValue - minValue;
        if (range === 0)
            throw new Error(`Cannot normalize ScoreMap containing just one value: ${minValue}`);
        return new this.constructor(this.mapNonNull(v => (v-minValue)/range));
    };

    inverse() {
        const [minValue, maxValue] = this.minMax();
        return new this.constructor(this.mapNonNull(v => minValue+maxValue-v));
    };
};

module.exports = {
    ScoreMap: ScoreMap,
};
