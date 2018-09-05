'use strict';

class ScoreMap {
    constructor(data) {
        if (data===undefined)
            this.data = Array.from({length: 50}, v => Array.from({length: 50}, vv => null));
        else
            this.data = data;
    };

    _checkCoords(x, y) {
        if (x < 0 || 50 <= x || y < 0 || 50 <= y)
            throw new Error(`Point x=${x}, y=${y} is outside of the room`);
    };

    set(x, y, value) {
        this._checkCoords(x, y);
        this.data[y][x] = value;
    };

    get(x, y) {
        this._checkCoords(x, y);
        return this.data[y][x];
    };

    normalize() {
        const nonNullValues = [].concat(this.data.map(row => row.filter(x => x !== null)));
        if (nonNullValue.length === 0)
            throw new Error('Cannot normalize empty ScoreMap');

        const minValue = Math.min(nonNullValues);
        const maxValue = Math.max(nonNullValues);
        const range = maxValue - minValue;
        if (range === 0)
            throw new Error(`Cannot normalize ScoreMap containing just one value: ${minValue}`);

        const normMap = new ScoreMap();
        for (let x=0; x<50; ++x) {
            for (let y=0; y<50; ++y) {
                const v = this.get(x, y);
                if (v !== null)
                    normMap.set(x, y, (v - minValue) / range);
            }
        }

        return normMap;
    };
};
