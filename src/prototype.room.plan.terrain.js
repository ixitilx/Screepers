'use strict';

const {assert, createArray} = require('utils.prototype');

const {TerrainMap} = require('map.terrain');
const {DistanceMap} = require('map.distance');
const {ScoreMap} = require('map.score');
const {ColorMap} = require('map.color');
const {RoomMap, idxToPos} = require('map.room');
const {RoomPlan} = require('plan.room');

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

function drawRow(room, y, row) {
    // const drawLog = function(value, x) {
    //     console.log(`Drawing ${x}, ${y}, ${value}`);
    //     visual.circle(x, y, value)
    // };
    row.forEach((value, x) => room.visual.circle(x, y, {fill:value}));
    // row.forEach(drawLog);
};

const tm = {};
const dm = {};
const named_sdm = {};

function getTerrainMap(room) {
    if(!(room.name in tm))
        tm[room.name] = new TerrainMap(room);
    return tm[room.name];
};

function getDistanceMap(name, terrainMap, positions, callback) {
    if(!(name in dm)) {
        if (typeof(positions) === 'function')
            positions = positions();
        const newDistanceMap = new DistanceMap(terrainMap, positions);
        dm[name] = callback ? callback(newDistanceMap) : newDistanceMap;
    }
    return dm[name];
};

function getPositions(value, terrainMap) {
    const out = [];
    if (!(terrainMap instanceof TerrainMap))
        throw new Error(`Not a TerrainMap: ${terrainMap}`);

    _.each(terrainMap.data, (v, i) => {
        if (value===v) {
            const [x, y] = idxToPos(i);
            out.push({x:x, y:y});
        }
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

    new RoomPlan(room.name);

    let cpu = Game.cpu.getUsed();
    let cpy;

    const terrainMap = getTerrainMap(room);
    cpy = Game.cpu.getUsed();
    console.log('terrainMap', cpy-cpu);
    cpu = cpy;

    const gdm = (obj) => getDistanceMap(obj.id, terrainMap, obj.pos, m => m.inverse());
    const sourceMaps = room.find(FIND_SOURCES).map(gdm);
    const mineralMaps = room.find(FIND_MINERALS).map(gdm);
    const controllerMap = gdm(room.controller);

    const wallMap = getDistanceMap(
        `walls_${room.name}`,
        terrainMap,
        () => getPositions('#', terrainMap));

    const exits = terrainMap.getAllExits();
    const exitMaps = exits.map((pos, i) => {
        return getDistanceMap(
            `exit_${room.name}_${i}`,
            terrainMap,
            pos
        );
    });

    // const megaExit = _.flatten(exits);
    // const megaExitMap = getDistanceMap('megaExit', terrainMap, megaExit);

    const combinedExitMap = DistanceMap.combineAdd(exitMaps);

    const allMaps = [].concat(sourceMaps, mineralMaps, exitMaps, [combinedExitMap, controllerMap, wallMap]);
    const distanceMap = allMaps[Game.time % allMaps.length];
    // const distanceMap = exitMaps[Game.time % exitMaps.length];
    cpy = Game.cpu.getUsed();
    console.log('distanceMap', cpy-cpu);
    cpu = cpy;

    const colorMap = new ColorMap(distanceMap);
    cpy = Game.cpu.getUsed();
    console.log('colorMap', cpy-cpu);
    cpu = cpy;

    room.drawColorMap(colorMap);
    cpy = Game.cpu.getUsed();
    console.log('drawCircle', cpy-cpu);
};

module.exports = drawSomething;
