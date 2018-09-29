'use strict';

const {ColorMap} = require('map.color');
const {idxToPos} = require('map.room');

function drawColorMap(colorMap) {
    if (!(colorMap instanceof ColorMap))
        throw new Error(`Not a color map: ${colorMap}`);

    colorMap.data.forEach((c, i) => {
        if (c) {
            const [x, y] = idxToPos(i);
            this.visual.circle(x, y, {fill:c});
        }
    });
};

Room.prototype.drawColorMap = drawColorMap;
