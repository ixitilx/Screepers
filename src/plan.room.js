'use strict';

const {TerrainMap} = require('map.terrain');
const {DistanceMap} = require('map.distance');
const {ScoreMap} = require('map.score');
const {ColorMap} = require('map.color');
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

class RoomPlan {
    constructor(room) {
        let cpu = Game.cpu.getUsed();
        console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} Cpu:${cpu.toFixed(2)} `, 80, '-'));

        const terrainMap = get(`${room.name}_terrain`, () => new TerrainMap(room.name));

        const inverse3 = m => m.inverse().mapNonNull(v => v*v*v).normalize();
        const positive3 = m => m.mapNonNull(v => v*v*v).normalize();
        const gdm = pos => {
            try {
                return new DistanceMap(terrainMap, pos);
            } catch (error) {
                return null;
            }
        }
        const gdm_ro = ro => gdm(ro.pos);
        
        const sourceMaps = get(`${room.name}_sources`, () => room.find(FIND_SOURCES).map(gdm_ro));
        const sourceRangeMaps = get(`${room.name}_sources_range`, () => sourceMaps.map(inverse3));
        const sourceCombined = get(`${room.name}_sources_combined`, () => ScoreMap.combineAdd(sourceRangeMaps));

        const mineralMaps = get(`${room.name}_minerals`, () => room.find(FIND_MINERALS).map(gdm_ro));
        const mineralRangeMaps = get(`${room.name}_minerals_range`, () => mineralMaps.map(inverse3));
        const mineralCombined = get(`${room.name}_minerals_combined`, () => ScoreMap.combineAdd(mineralRangeMaps).normalize());

        const exitMaps = get(`${room.name}_exits`, () => terrainMap.getAllExits().map(gdm).filter(m => m).map(m => m.normalize()));
        const exitsCombined = get(`${room.name}_exits_combined`, () => ScoreMap.combineAdd(exitMaps).normalize());

        const controllerMap = get(`${room.name}_controller`, () => inverse3(gdm_ro(room.controller)));
        const wallMap = get(`${room.name}_walls`, () => gdm(getWallPositions(terrainMap)).normalize());

        const everythingMap = get(`${room.name}_everything_combined`, () => {
            const what = [sourceCombined, mineralCombined, exitsCombined, controllerMap, wallMap];
            const how = ([s, m, e, c, w]) => 3*s + 1*m + 1*e + 3*c + 5*w;
            return ScoreMap.combineNotNull(what, how).normalize();
        });

        const basePos = get(`${room.name}_base_pos`, () => {
            const score = everythingMap.getBestScore();
            return idxToPos(score[_.random(score.length-1)]);
        });

        room && room.visual.circle(basePos[0], basePos[1], {fill: 'green', radius: 0.5});

        const colorMap = get(`${room.name}_color`, () => new ColorMap(everythingMap));

        // room && room.drawColorMap(colorMap);
        const cpuEnd = (Game.cpu.getUsed() - cpu);
        console.log(`Cpu: +${cpuEnd.toFixed(2)}`);
    };
};

module.exports = {
    RoomPlan : RoomPlan,
};

/*
    Thoughts

    get is quite useful and could be generalized
    roomdata could be preserved so no room instance is needed for a plan
    zones can be scanned with n-brush-size to identify constrictions
*/
