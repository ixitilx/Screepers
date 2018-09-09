'use strict';

const {TerrainMap} = require('map.terrain');
const {DistanceMap} = require('map.distance');
const {posToIdx} = require('map.room');

const terrainMapCache = {};

function terrainMapMemoryPath(roomName) {
    return ['rooms', roomName, 'terrain'];
};

function loadTerrainMap(path) {
    const terrainMemory = _.get(Memory, path);
    if (terrainMemory)
        return new TerrainMap(terrainMemory);
};

function scanTerrainMap(room) {
    if (room instanceof Room)
        return new TerrainMap(room);
};

function getTerrainMap(roomName) {
    const mPath = terrainMapMemoryPath(roomName);
    const m = terrainMapCache[roomName] || loadTerrainMap(mPath) || scanTerrainMap(Game.rooms[roomName]);
    if (!m)
        throw new Error(`Unable to get TerrainMap for room ${roomName}`);
    if (!_.has(Memory, mPath))
        _.set(Memory, mPath, m.data);
    if (!(roomName in terrainMapCache))
        terrainMapCache[roomName] = m;
    return m;
};

const distanceMapCache = {};

function sourcePositionsMemoryPath(roomName) {
    return ['rooms', roomName, 'sourcePositions'];
};

function loadSourcePositions(path) {
    const sourcePositionsMemory = _.get(Memory, path);
    if (sourcePositionsMemory)
        return sourcePositionsMemory;
};

function scanSourcePositions(room) {
    if (room instanceof Room) {
        const out = {};
        room.find(FIND_SOURCES)
            .forEach(s => out[s.id] = {x: s.pos.x, y: s.pos.y});
        return out;
    }
};

function getSourcePositions(roomName) {
    const mPath = sourcePositionsMemoryPath(roomName);
    const m = loadSourcePositions(roomName) || scanSourcePositions(Game.rooms[roomName]);
    if (!m)
        throw new Error(`Unable to get source positions for room ${roomName}`);
    if (!_.has(Memory, mPath))
        _.set(Memory, mPath, m);
    return _.values(m);
};

function getDistanceMap(roomName, position) {
    const {x, y} = position;
    const idx = posToIdx(x, y);
    const key = `${roomName}_${idx}`;

    const terrainMap = getTerrainMap(roomName);

    const m = distanceMapCache[key] || new DistanceMap(terrainMap, position);
    if (!(key in distanceMapCache))
        distanceMapCache[key] = m;
    return m;
};

function getSourceMaps(roomName) {
    const sourcePositions = getSourcePositions(roomName);
    return sourcePositions.map(p => getDistanceMap(roomName, p));
};

class RoomPlan {
    constructor(roomName) {
        this.terrainMap = getTerrainMap(roomName);
        this.sourceMaps = getSourceMaps(roomName);
        // this.controllerPosition = getControllerMap(roomName);
    };
};

module.exports = {
    RoomPlan : RoomPlan,
};
