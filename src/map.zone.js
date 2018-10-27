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

function updateReach(value, tileId, data, terrainMap) {
    if (Number.isInteger(value))
        return value;

    const [x, y] = idxToPos(tileId);
    const r = reach(x, y, terrainMap, 0);
    return r;
};

function setReachArea(tileId, a, reachMap) {
    const v = reachMap[tileId];
    if (!v)
        return null;
    const [x, y] = idxToPos(tileId);
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

function setZoneData(v, i, areaMapData, zoneMapData, zones) {
    if (Number.isInteger(zoneMapData[i]) || areaMapData[i] === null)
        return;

    const zone = floodFill([i], idx => areaMapData[i] === areaMapData[idx]);
    zone.forEach(idx => zoneMapData[idx] = zones.length);
    zones.push(zone);
};

function findZoneLinks(zones, zoneMapData) {
    const links = {};
    zones.forEach((zone, zoneId) => {
        const zoneLinks = {};

        const surroundings = floodFillStep(
            zone,
            new Set(zone),
            idx => _.inRange(idx, 0, 2500) && zoneMapData[idx] !== null);

        surroundings.forEach(posIdx => {
            const otherZoneIdx = zoneMapData[posIdx];
            if (!(otherZoneIdx in zoneLinks))
                zoneLinks[otherZoneIdx] = [];
            zoneLinks[otherZoneIdx].push(posIdx);
        });

        links[zoneId] = zoneLinks;
    });
    return links;
};

function mergeZones(zones, links) {
    // those which are connected to only one another zone
    const findLeafZones = () => _(links).pairs()
                                        .filter(([idx, links]) => _.size(links) === 1)
                                        .map(([idx, links]) => [idx, _.keys(links)[0]])
                                        .value();

    function mergeZone(srcIdx, dstIdx) {
        Array.prototype.push.apply(zones[dstIdx], zones[srcIdx]);
        zones[srcIdx] = [];
        links[srcIdx] = {};
        delete links[dstIdx][srcIdx];
    };

    for (let leafs = findLeafZones(); _.size(leafs); leafs = findLeafZones()) {
        _.each(leafs, ([srcIdx, dstIdx]) => mergeZone(srcIdx, dstIdx));
    };
};

function buildAreaMapData(terrainMap) {
    const reachMapData = Array.from({length: 2500})
                              .map((v, i, a) => updateReach(v, i, a, terrainMap))
                              .map(v => v === 0 ? null : v);

    const areaMapData = Array.from({length: 2500}, v => null);
    _.each(areaMapData, (v, i, a) => setReachArea(i, a, reachMapData));

    const zones = [];
    const zoneMapData = Array.from({length: 2500}, v => null);
    _.each(areaMapData, (v, i, a) => setZoneData(v, i, a, zoneMapData, zones));

    const zoneLinks = findZoneLinks(zones, zoneMapData);
    mergeZones(zones, zoneLinks);

    _.each(zones,
        (zone, zoneId) => _.each(zone,
            tileId => zoneMapData[tileId] = zoneId));

    return [zoneMapData, zones, zoneLinks];
};

class ZoneMap extends RoomMap {
    constructor(arg) {
        if (arg instanceof TerrainMap) {
            const [zoneMapData, zones, zoneLinks] = buildAreaMapData(arg);
            super(zoneMapData);
            this.zones = zones;
            this.zoneLinks = zoneLinks;
        } else if (arg instanceof ZoneMap) {
            super(arg);
            this.zones = arg.zones;
            this.zoneLinks = arg.zoneLinks;
        } else {
            throw new Error(`Cannot initialize from ${arg}`);            
        }
    };
};

module.exports = {
    ZoneMap: ZoneMap,
};
