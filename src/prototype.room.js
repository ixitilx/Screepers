'use strict';

const { defineProperty } = require('utils.prototype');

function findSources() {
    return this.find(FIND_SOURCES);
};

const terrainMap = {
    'plain': 0,
    'swamp': 1,
    'wall' : 2
};

function scanRow(room, rowIdx) {
    return room.lookForAtArea(LOOK_TERRAIN, rowIdx, 0, rowIdx, 49, true)
                    .map(rec => terrainMap[rec.terrain])
                    .join('');
};

function buildTerrainMap(room) {
    return Array.from({length: 50}, (v, i) => scanRow(room, i));
};

defineProperty(Room, 'sources', _.memoize(findSources));
defineProperty(Room, 'terrain', _.memoize(buildTerrainMap));

//
// plan is refill && build && upgrade
// we need energy for all three
// we need scouting for energy
// energy is creeps, infrastructure
// energy/mineral infrastructure is container + road
//
// first thing to do is to build source/mineral roads
//

// STRUCTURE_SPAWN: "spawn",
// STRUCTURE_EXTENSION: "extension",
// STRUCTURE_STORAGE: "storage",
// STRUCTURE_LINK: "link",
// STRUCTURE_TOWER: "tower",
// STRUCTURE_OBSERVER: "observer",
// STRUCTURE_POWER_SPAWN: "powerSpawn",
// STRUCTURE_EXTRACTOR: "extractor",
// STRUCTURE_LAB: "lab",
// STRUCTURE_TERMINAL: "terminal",
// STRUCTURE_CONTAINER: "container",
// STRUCTURE_NUKER: "nuker",

// STRUCTURE_CONTROLLER: "controller",
// STRUCTURE_PORTAL: "portal",
// STRUCTURE_POWER_BANK: "powerBank",
// STRUCTURE_KEEPER_LAIR: "keeperLair",

// STRUCTURE_ROAD: "road",
// STRUCTURE_WALL: "constructedWall",
// STRUCTURE_RAMPART: "rampart",

