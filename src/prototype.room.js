'use strict';

const { defineProperty } = require('utils.prototype');

const costMatrices = { };
const grandPlans = { };

function findSources() {
    return this.find(FIND_SOURCES);
};

function grandPlan() {
    const controller = this.controller;
    const sources = this.find(FIND_SOURCES);
    const minerals = this.find(FIND_MINERALS);
    const exits = Game.map.describeExits(this.name);
    const spawns = _.filter(Game.spawns, {room: {name: this.name}});


};

function getGrandPlan() {
    
};

function populateCostMatrix(matrix, grandPlan) {

};

function createCostMatrix(roomName) {
    return populateCostMatrix(
        new PathFinder.CostMatrix(),
        getGrandPlan(roomName));
};

function getCostMatrix(roomName) {
    if (!(roomName in costMatrices)) {
        const path = ['rooms', roomName, 'costMatrix'];
        if (!_.has(Memory, path)) {
            const costMatrix = createCostMatrix(roomName);
            _.set(Memory, path, costMatrix.serialize());
            return costMatrices[roomName] = costMatrix;
        } else {
            const costMatrixDump = _.get(Memory, path);
            const costMatrix = PathFinder.CostMatrix.deserialize(costMatrixDump);
            return costMatrices[roomName] = costMatrix;
        }
    }

    return costMatrices[roomName];
};

function findPath(origin, goal) {
    const ret = PathFinder.search(origin, goal, {
        roomCallback: getCostMatrix,
        plainCost: 2,
        swampCost: 10
    });


};

function findControllerPath(controller, spawns) {
};

function findSourcePath(source, spawns) {
};


defineProperty(Room, 'sources', findSources);

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

