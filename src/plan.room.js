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

function getWallPositions(terrainMap) {
    const out = [];
    if (!(terrainMap instanceof TerrainMap))
        throw new Error(`Not a TerrainMap: ${terrainMap}`);

    _.each(terrainMap.data, (v, i) => {
        const [x, y] = idxToPos(i);
        if (v === '#' || x === 0 || x === 49 || y === 0 || y === 49)
            out.push({x:x, y:y});
    });
    return out;
};

function makeCombiner(func) {
    return (numbers) => _.every(numbers, _.isNumber) ? func(...numbers) : null;
};

class RoomPlan {
    constructor(room) {
        const roomName = room.name;

        let cpu = Game.cpu.getUsed();
        console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} Cpu:${cpu.toFixed(2)} `, 80, '-'));

        const terrainMap = get(`${room.name}_terrain`, () => new TerrainMap(roomName));

        const inverse3 = m => m.inverse().mapNonNull(v => v*v*v).normalize();
        const positive3 = m => m.mapNonNull(v => v*v*v).normalize();
        const gdm = pos => new DistanceMap(terrainMap, pos);
        const gdm_ro = ro => gdm(ro.pos);
        
        const controllerMap = get(`${room.name}_controller`, () => gdm_ro(room.controller));
        const wallMap = get(`${room.name}_walls`, () => gdm(getWallPositions(terrainMap)));
        const exitMaps = get(`${room.name}_exits`, () => terrainMap.getAllExits().map(gdm));

        const sourceMaps = get(`${room.name}_sources`, () => room.find(FIND_SOURCES).map(gdm_ro));
        const mineralMaps = get(`${room.name}_minerals`, () => room.find(FIND_MINERALS).map(gdm_ro));
        const sourceRangeMaps = get(`${room.name}_sources_range`, () => sourceMaps.map(inverse3));
        const mineralRangeMaps = get(`${room.name}_minerals_range`, () => mineralMaps.map(inverse3));

        const maps = [controllerMap, wallMap].concat(sourceRangeMaps, mineralRangeMaps, exitMaps);
        const index = Game.time % maps.length;
        const combinedMap = maps[index];

        const colorMap = get(`${room.name}_color_${Game.time % maps.length}`, () => new ColorMap(combinedMap));

        room && room.drawColorMap(colorMap);
        const cpuEnd = (Game.cpu.getUsed() - cpu);
        console.log(`Cpu: +${cpuEnd.toFixed(2)}`);
    };
};

module.exports = {
    RoomPlan : RoomPlan,
};
