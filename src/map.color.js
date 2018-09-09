'use strict';

const {ScoreMap} = require('map.score');
const {RoomMap} = require('map.room');

function hexColorFromWeight(weight) {
    return _.padLeft(Math.floor(255*weight).toString(16), 2, '0');
    // const color = Math.floor(Math.min(255, Math.max(256 * weight, 0)));
    // const hexcolor = _.padLeft(color.toString(16), 2, '0');
    // return hexcolor;
};

function colorFromWeight(weight) {
    if (weight !== null && 0 <= weight && weight <= 1) {
        const invWeight = 1 - weight;
        const red = hexColorFromWeight(invWeight);
        const green = hexColorFromWeight(weight);
        const color = `#${red}${green}00`;
        return color;
    }
    return null;
};

function getNormalizedScoreMap(scoreMap) {
    const [minValue, maxValue] = scoreMap.minMax();
    if (minValue === 0 && maxValue === 1)
        return scoreMap;
    return scoreMap.normalize();
};

function buildColorMapData(scoreMap) {
    const normData = getNormalizedScoreMap(scoreMap).data;
    return normData.map(colorFromWeight);
};

class ColorMap extends RoomMap {
    constructor(data) {
        if (data instanceof ScoreMap) {
            super(buildColorMapData(data));
        } else {
            super(data);
        }
    };
};

module.exports = {
    ColorMap: ColorMap,
};
