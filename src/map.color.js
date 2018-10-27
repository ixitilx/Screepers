'use strict';

const {ScoreMap} = require('map.score');
const {ZoneMap} = require('map.zone');
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

function buildScoreColorMapData(scoreMap) {
    const normData = getNormalizedScoreMap(scoreMap).data;
    return normData.map(colorFromWeight);
};

const allZoneColors = [
                       '#00FF00', '#FF0000', 
                       '#FFFF00', '#FF00FF', '#00FFFF',
                       '#80FF80', '#FF8080', '#8080FF',
                       '#FFFF80', '#FF80FF', '#80FFFF',
                       '#0000FF',
                       ];

function buildZoneColorMapData(zoneMap) {
    const zoneColors = {};

    function assignColors(zoneGroup) {
        const coloredZones = _.filter(zoneGroup, zoneId => zoneId in zoneColors);
        const usedColorIdx = new Set(_.map(coloredZones, zoneId => zoneColors[zoneId]));

        let counter = 0;
        function getNextColor() {
            counter += 1;
            for (let i=0; i<allZoneColors.length; ++i) {
                if (!usedColorIdx.has(i)) {
                    usedColorIdx.add(i);
                    return i;
                }
            }
            throw new Error(`Colors depleted (should not be possible?)`);
        };

        _.each(zoneGroup, zoneId => zoneColors[zoneId] = zoneColors[zoneId] || getNextColor());
    };

    _(zoneMap.zoneLinks)
        .pairs()
        .filter(([zoneId, links]) => _.size(links))
        .each(([zoneId, links]) => assignColors([zoneId, ..._.keys(links)]))
        .value();

    const colorData = Array.from({length:2500}, v => null);

    _.each(zoneMap.zones, (zone, zoneId) => 
        _.each(zone, tileId =>
            colorData[tileId] = allZoneColors[zoneColors[zoneId]]));

    return colorData;
};

class ColorMap extends RoomMap {
    constructor(data) {
        if (data instanceof ZoneMap) {
            super(buildZoneColorMapData(data));
        } else if (data instanceof ScoreMap) {
            super(buildScoreColorMapData(data));
        } else {
            super(data);
        }
    };
};

module.exports = {
    ColorMap: ColorMap,
};
