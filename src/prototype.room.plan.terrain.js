'use strict';

const {assert, createArray} = require('utils.prototype');
const {ScoreMap, buildDistanceMap} = require('ScoreMap');

const planEncodeMap = {
    'wall' : '#',
    'plain': ' ',
    'swamp': '*',
    STRUCTURE_SPAWN: 'O',
    STRUCTURE_EXTENSION: 'o',
    STRUCTURE_STORAGE: 'S',
    STRUCTURE_LINK: 'i',
    STRUCTURE_TOWER: 'T',
    STRUCTURE_OBSERVER: '?',
    STRUCTURE_POWER_SPAWN: '!',
    STRUCTURE_EXTRACTOR: 'E',
    STRUCTURE_LAB: 'L',
    STRUCTURE_TERMINAL: '$',
    STRUCTURE_CONTAINER: 'c',
    STRUCTURE_NUKER: 'N',

    STRUCTURE_CONTROLLER: '@',
    // STRUCTURE_PORTAL: "portal",
    // STRUCTURE_POWER_BANK: "powerBank",
    // STRUCTURE_KEEPER_LAIR: "keeperLair",

    STRUCTURE_ROAD: '~',
    STRUCTURE_WALL: '=',
    // STRUCTURE_RAMPART: "rampart",
};

const planDecodeMap = _.invert(planEncodeMap);

// function isInRoom(p) {
//     return (0 <= p.x && p.x < 50) && (0 <= p.y && p.y < 50);
// };

// function posAround(p, pos) {
//     const out = [];
//     [-1, 0, 1].forEach(dy =>
//         [-1, 0, 1].forEach(function(dx) {
//             const pt = {x: p.x + dx, y: p.y + dy};
//             if (isInRoom(pt) && pos[pt.y][pt.x]===false) {
//                 out.push(pt);
//                 pos[pt.y][pt.x] = true;
//             }
//         }));
//     return out;
// };

// function buildDistanceMap(positions, terrainMap) {
//     if (!_.isArray(positions) && positions.x && positions.y)
//         positions = [positions];

//     const out = createArray(() => null, [50, 50]);
//     const pos = createArray(() => false, [50, 50]);
    
//     let queue = positions.map(p => _.pick(p, ['x', 'y']));
//     queue.forEach(p => pos[p.y][p.x] = true);

//     let score;
//     for (score = 0; queue.length > 0; score++) {
//         queue.filter(p => terrainMap[p.y][p.x] !== '#')
//              .forEach(p => out[p.y][p.x] = score);

//         queue = _(queue).map(p => posAround(p, pos)).flatten().value();
//         queue = _.filter(queue, p => terrainMap[p.y][p.x] !== '#');
//         queue = _.filter(queue, p => out[p.y][p.x] === null);
//     };

//     return {distanceMap: out, maxScore: score-1};
// };

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

function normalizeRow(row, maxScore) {
    return row.map(value => value === null ? null : value/maxScore);
};

function buildColorMap(distanceMap) {
    const colorMap = distanceMap.data.map(row => row.map(colorFromWeight));
    return colorMap;
};

function drawRow(room, y, row) {
    // const drawLog = function(value, x) {
    //     console.log(`Drawing ${x}, ${y}, ${value}`);
    //     visual.circle(x, y, value)
    // };
    row.forEach((value, x) => room.visual.circle(x, y, {fill:value}));
    // row.forEach(drawLog);
};

const tm = {};
const go_sdm = {};
const named_sdm = {};

function getTerrainMap(room) {
    if(!(room.name in tm))
        tm[room.name] = room.scanTerrain();
    return tm[room.name];
};

function getDistanceMap(obj, terrainMap, callback) {
    if (obj instanceof RoomObject) {
        if (!(obj.id in go_sdm)) {
            const m = buildDistanceMap(obj.pos, terrainMap);
            go_sdm[obj.id] = callback ? callback(m) : m;
        }
        return go_sdm[obj.id];
    } else if (obj.name && obj.posArray) {
        if (!(obj.name in named_sdm)) {
            const m = buildDistanceMap(obj.posArray, terrainMap);
            named_sdm[obj.name] = callback ? callback(m) : m;
        }
        return named_sdm[obj.name];
    }
    throw new Error(`Cannot get distance map for ${obj}`);
};

function getPositions(item, terrainMap) {
    const out = [];
    terrainMap.forEach((row, y) => {
        _.each(row, (value, x) => {
            if (value===item)
                out.push({x:x, y:y});
        });
    });
    return out;
};

function getRowExits(row) {
    let start = 0;
    const out = [];
    let prev = row[0];
    for (let idx = 1; idx < row.length; ++idx) {
        let curr = row[idx];
        if (prev === '#' && curr !== '#')
            start = idx;
        else if(prev !== '#' && curr === '#')
            out.push([start, idx-1]);
        prev = curr;
    }
    return out;
};

function exitToPosArray(start, end, func) {
    const out = [];
    for (let x = start; x <= end; ++x)
        out.push(func(x));
    return out;
};

function getExits(terrainMap) {
    const topExits = getRowExits(terrainMap[0]).map(
        r => exitToPosArray(r[0], r[1], x => ({x:x, y:0})));

    const botExits = getRowExits(terrainMap[terrainMap.length-1]).map(
        r => exitToPosArray(r[0], r[1], x => ({x:x, y:49})));

    const leftRow = terrainMap.map(row => row[0]).join('');
    const leftExits = getRowExits(leftRow).map(
        r => exitToPosArray(r[0], r[1], x => ({x:0, y:x})));

    const rightRow = terrainMap.map(row => row[49]).join('');
    const rightExits = getRowExits(rightRow).map(
        r => exitToPosArray(r[0], r[1], x => ({x:49, y:x})));
    return [].concat(topExits, leftExits, botExits, rightExits);
};

function drawSomething(room) {
    console.log(_.padRight(`Time:${Game.time} Bucket:${Game.cpu.bucket} `, 80, '-'));

    let cpu = Game.cpu.getUsed();
    let cpy;

    const terrainMap = getTerrainMap(room);
    cpy = Game.cpu.getUsed();
    console.log('terrainMap', cpy-cpu);
    cpu = cpy;

    const gdm = (obj) => getDistanceMap(obj, terrainMap);
    const sourceMaps = room.find(FIND_SOURCES).map(s => getDistanceMap(s, terrainMap, m => m.update(v => v*v).inverse()));
    const mineralMaps = room.find(FIND_MINERALS).map(gdm);
    const controllerMap = gdm(room.controller);
    
    const wallMap = getDistanceMap(
        {name: 'wall', posArray: getPositions('#', terrainMap)},
        terrainMap,
        scoreMap => scoreMap.inverse().normalize());

    // const exitMaps = getExits(terrainMap).map((exitPosArray, idx) => {
    //     return getDistanceMap(
    //         {name: `exit_${idx+1}`, posArray: exitPosArray},
    //         terrainMap);
    // });
    
    // const exitMap = ScoreMap.combine(
    //     arr => _.any(arr) ? _.sum(_.map(arr, x => x*x)) : null,
    //     ...exitMaps).normalize();

    // const sourceMap = ScoreMap.combine(
    //     (arr, x, y) => {
    //         console.log(x, y, JSON.stringify(arr));
    //         return _.all(arr) ? _.sum(_.map(arr, v => v*v)) : null;
    //     },
    //     ...exitMaps).normalize();

    // const distanceMap = exitMaps[Game.time % exitMaps.length];
    const distanceMap = sourceMaps[0].normalize();
    cpy = Game.cpu.getUsed();
    console.log('distanceMap', cpy-cpu);
    // distanceMap.data.forEach(row => console.log(row));
    // console.log(distanceMap);
    cpu = cpy;

    const colorMap = buildColorMap(distanceMap);
    cpy = Game.cpu.getUsed();
    console.log('colorMap', cpy-cpu);
    cpu = cpy;

    colorMap.forEach((row, y) => drawRow(room, y, row));
    cpy = Game.cpu.getUsed();
    console.log('drawCircle', cpy-cpu);
};

module.exports = drawSomething;
