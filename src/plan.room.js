'use strict';

const {TerrainMap} = require('map.terrain');
const {DistanceMap} = require('map.distance');
const {ScoreMap} = require('map.score');
const {ColorMap} = require('map.color');
const {ZoneMap} = require('map.zone');
const {posToIdx, idxToPos} = require('map.room');

const terrainMapCache = {};

const cache = {};

function get(name, builder) {
    if (!(name in cache)) {
        cache[name] = builder();
    }
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

function getBasePos(roomName) {
    let cpu = Game.cpu.getUsed();
    console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} Cpu:${cpu.toFixed(2)} `, 80, '-'));

    const terrainMap = get(`${roomName}_terrain`, () => new TerrainMap(roomName));

    const inverse3 = m => m.inverse().mapNonNull(v => v*v*v).normalize();
    const positive3 = m => m.mapNonNull(v => v*v*v).normalize();
    const gdm = pos => {
        try {
            return new DistanceMap(terrainMap, pos);
        } catch (error) {
            // throw error;
            return null;
        }
    }
    const gdm_idx = obj => {
        const [x, y] = idxToPos(obj.pos);
        return gdm({x:x, y:y});
    };
    
    const roomData = _.get(Memory, ['rooms', roomName, 'data']);

    const sourceMaps = get(`${roomName}_sources`, () => roomData.sources.map(gdm_idx));
    const sourceRangeMaps = get(`${roomName}_sources_range`, () => sourceMaps.map(inverse3));
    const sourceCombined = get(`${roomName}_sources_combined`, () => ScoreMap.combineAdd(sourceRangeMaps));

    const mineralMaps = get(`${roomName}_minerals`, () => roomData.minerals.map(gdm_idx));
    const mineralRangeMaps = get(`${roomName}_minerals_range`, () => mineralMaps.map(inverse3));
    const mineralCombined = get(`${roomName}_minerals_combined`, () => ScoreMap.combineAdd(mineralRangeMaps).normalize());

    const exitMaps = get(`${roomName}_exits`, () => terrainMap.getAllExits().map(gdm).filter(m => m).map(m => m.normalize()));
    const exitsCombined = get(`${roomName}_exits_combined`, () => ScoreMap.combineAdd(exitMaps).normalize());

    const controllerMap = get(`${roomName}_controller`, () => inverse3(gdm_idx(roomData.controller)));
    const wallMap = get(`${roomName}_walls`, () => gdm(getWallPositions(terrainMap)).normalize());

    const everythingMap = get(`${roomName}_everything_combined`, () => {
        const what = [sourceCombined, mineralCombined, exitsCombined, controllerMap, wallMap];
        const how = ([s, m, e, c, w]) => 3*s + 1*m + 1*e + 3*c + 5*w;
        return ScoreMap.combineNotNull(what, how).normalize();
    });

    const basePos = get(`${roomName}_base_pos`, () => {
        const score = everythingMap.getBestScore();
        return idxToPos(score[_.random(score.length-1)]);
    });

    const colorMap = get(`${roomName}_color`, () => new ColorMap(everythingMap));

    // room && room.drawColorMap(colorMap);
    const cpuEnd = (Game.cpu.getUsed() - cpu);
    console.log(`Cpu: +${cpuEnd.toFixed(2)}`);
    return basePos;
};

class RoomPlan {
    constructor(roomName) {
        // const basePos = getBasePos(roomName);
        // Game.rooms[roomName] && Game.rooms[roomName].visual.circle(basePos[0], basePos[1], {fill: 'green', radius: 0.5});
        let cpu = Game.cpu.getUsed();

        const terrainMap = get(`${roomName}_terrain`, () => new TerrainMap(roomName));
        const zoneMap = get(`${roomName}_area`, () => new ZoneMap(terrainMap));
        const colorMap = get(`${roomName}_area_color`, () => new ColorMap(zoneMap));
        Game.rooms[roomName].drawColorMap(colorMap);
        const cpuEnd = (Game.cpu.getUsed() - cpu);
        console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} Cpu:${cpuEnd.toFixed(2)} `, 80, '-'));
        for(const prop in cache)
            delete cache[prop];
    };
};

module.exports = {
    RoomPlan : RoomPlan,
};

/*
    Thoughts

    get is quite useful and could be generalized
    zones can be scanned with n-brush-size to identify constrictions
*/
