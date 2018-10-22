'use strict';

const {posToIdx, idxToPos, inBuildingRange, floodFill, floodFillStep} = require('map.room'); 
const {RoomMap} = require('map.room');
const {ScoreMap} = require('map.score');
const {TerrainMap} = require('map.terrain');

function reach(x, y, terrainMap, howFar) {
    const right = x + howFar;
    const bottom = y + howFar;
    if (!inBuildingRange(right, bottom))
        return howFar;

    let canReach = true;
    for (let i=0; i<=howFar && canReach; ++i)
        canReach = terrainMap.getPos(right, y+i) !== '#';
    for (let i=0; i<=howFar && canReach; ++i)
        canReach = terrainMap.getPos(x+i, bottom) !== '#';
    return canReach ? reach(x, y, terrainMap, howFar + 1) : howFar;
};

function updateReach(value, idx, data, terrainMap) {
    if (Number.isInteger(value))
        return value;

    const [x, y] = idxToPos(idx);
    const r = reach(x, y, terrainMap, 0);
    return r;
};

function setReachArea(i, a, reachMap) {
    const v = reachMap[i];
    if (!v)
        return null;
    const [x, y] = idxToPos(i);
    for (let dx=0; dx<v; ++dx) {
        for (let dy=0; dy<v; ++dy) {
            const di = posToIdx(x+dx, y+dy);
            const currentValue = a[di];
            const reachValue = reachMap[di];
            if (reachValue !== null && (!Number.isInteger(currentValue) || currentValue < v))
                a[di] = v;
        }
    }
};

function setSegmentData(v, i, areaMapData, segmentMapData, segments) {
    if (Number.isInteger(segmentMapData[i]) || areaMapData[i] === null)
        return;

    const segment = floodFill([i], idx => areaMapData[i] === areaMapData[idx]);
    segment.forEach(idx => segmentMapData[idx] = segments.length);
    segments.push(segment);
};

function findSegmentLinks(segments, segmentMapData) {
    const links = {};
    segments.forEach((segment, segmentIdx) => {
        const segmentLinks = {};

        const immediateOutreach = floodFillStep(
                segment,
                new Set(segment),
                idx => _.inRange(idx, 0, 2500) && segmentMapData[idx] !== null);

        immediateOutreach.forEach(posIdx => {
            const neighborSegment = segmentMapData[posIdx];
            if (!(neighborSegment in segmentLinks))
                segmentLinks[neighborSegment] = [];
            segmentLinks[neighborSegment].push(posIdx);
        });

        links[segmentIdx] = segmentLinks;
    });
    return links;
};

function buildAreaMapData(terrainMap) {
    const reachMapData = Array.from({length: 2500})
                              .map((v, i, a) => updateReach(v, i, a, terrainMap))
                              .map(v => v === 0 ? null : v);

    const areaMapData = Array.from({length: 2500}, v => null);
    _.each(areaMapData, (v, i, a) => setReachArea(i, a, reachMapData));

    const segments = [];
    const segmentMapData = Array.from({length: 2500}, v => null);
    const cpu = Game.cpu.getUsed();
    _.each(areaMapData, (v, i, a) => setSegmentData(v, i, a, segmentMapData, segments));

    const segmentLinks = findSegmentLinks(segments, segmentMapData);

    return segmentMapData;
};

class AreaMap extends ScoreMap {
    constructor(terrainMap) {
        if (terrainMap instanceof TerrainMap)
            super(buildAreaMapData(terrainMap));        
        else
            super(terrainMap);
        //throw new Error(`Cannot initialize from ${terrainMap}`);
    };
};

module.exports = {
    AreaMap: AreaMap,
};
