'use strict';

const {TerrainMap} = require('map.terrain');
const {DistanceMap} = require('map.distance');
const {ColorMap} = require('map.color');
const {posToIdx, idxToPos} = require('map.room');

const terrainMapCache = {};

const cache = {};

function get(name, builder) {
    if (!(name in cache))
        cache[name] = builder();
    return cache[name];
};

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

function getDistanceMap(roomName, position, key) {
    if (!key) {
        const {x, y} = position;
        const idx = posToIdx(x, y);
        key = `${roomName}_${idx}`;
    }

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

function getControllerMap(roomName) {
    return getDistanceMap(roomName, Game.rooms[roomName].controller.pos);
};

function getMineralMaps(roomName) {
    return Game.rooms[roomName]
               .find(FIND_MINERALS)
               .map(m => getDistanceMap(roomName, m.pos));
};

function getTerrainPositions(value, terrainMap) {
    const out = [];
    if (!(terrainMap instanceof TerrainMap))
        throw new Error(`Not a TerrainMap: ${terrainMap}`);

    _.each(terrainMap.data, (v, i) => {
        const [x, y] = idxToPos(i);
        if (value === v || x === 0 || x === 49 || y === 0 || y === 49) {
            out.push({x:x, y:y});
        }
    });
    return out;
};

function getWallMap(roomName) {
    const terrainMap = getTerrainMap(roomName);
    const positions = getTerrainPositions('#', terrainMap);
    return getDistanceMap(roomName, positions, `${roomName}_walls`);
};

function makeCombiner(func) {
    return (numbers) => _.every(numbers, _.isNumber) ? func(...numbers) : null;
};

class RoomPlan {
    constructor(room) {
        const roomName = room.name;

        const cpuStart = Game.cpu.getUsed();
        console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} Cpu: ${cpuStart.toFixed(2)} `, 80, '-'));

        const inverse3 = m => m.inverse().mapNonNull(v => v*v*v).normalize();
        const positive3 = m => m.mapNonNull(v => v*v*v).normalize();

        const terrainMap = get(`${room.name}_terrain`, () => new TerrainMap(room));
        const gdm = pos => new DistanceMap(terrainMap, pos);
        const gdm_ro = ro => gdm(ro.pos);
        
        const sourceMaps = get(`${room.name}_sources`, () => room.find(FIND_SOURCES).map(gdm_ro));
        const mineralMaps = get(`${room.name}_minerals`, () => room.find(FIND_MINERALS).map(gdm_ro));
        const controllerMap = get(`${room.name}_controller`, () => gdm_ro(room.controller));
        const wallMap = get(`${room.name}_walls`, () => gdm(getTerrainPositions('#', terrainMap)));
        const exitMaps = get(`${room.name}_exits`, () => terrainMap.getAllExits().map(gdm));

        const sourceRangeMaps = get(`${room.name}_sources_range`, () => sourceMaps.map(inverse3));
        const mineralRangeMaps = get(`${room.name}_minerals_range`, () => mineralMaps.map(inverse3));

        const maps = [controllerMap, wallMap].concat(sourceRangeMaps, mineralRangeMaps, exitMaps);
        const index = Game.time % maps.length;
        const combinedMap = maps[index];

        const colorMap = get(`color_map_${Game.time % maps.length}`, () => new ColorMap(combinedMap));

        room && room.drawColorMap(colorMap);
        const cpuEnd = (Game.cpu.getUsed()-cpuStart);
        console.log(`Cpu: +${cpuEnd.toFixed(2)}`);
    };
};

module.exports = {
    RoomPlan : RoomPlan,
};
