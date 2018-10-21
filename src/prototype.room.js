'use strict';

const {me} = require('ident');
const {ColorMap} = require('map.color');
const {posToIdx, idxToPos} = require('map.room');

function drawColorMap(colorMap) {
    if (!(colorMap instanceof ColorMap))
        throw new Error(`Not a color map: ${colorMap}`);

    colorMap.data.forEach((c, i) => {
        if (c) {
            const [x, y] = idxToPos(i);
            this.visual.circle(x, y, {fill:c});
        }
    });
};

function scanIdx(roomPosition) {
    return posToIdx(roomPosition.x, roomPosition.y);
}

function scanPos(roomObject) {
    return { pos: scanIdx(roomObject.pos) };
};

function scanPosHits(roomObject) {
    return { pos: scanIdx(roomObject.pos), hits: roomObject.hits };
};

function scanController(roomController) {
    if (!roomController)
        return null;

    const controller = {
        pos: scanIdx(roomController.pos),
    };

    if (roomController.reservation) {
        controller.reserved = {
            owner: roomController.reservation.username,
            ticks: roomController.reservation.ticksToEnd,
        };
    } else if (roomController.level > 0) {
        controller.owned = {
            owner: roomController.owner.username,
            level: roomController.level,
            progress: roomController.progress,
            downgradeTicks: roomController.ticksToDowngrade,
            blockedTicks: roomController.upgradeBlocked,
            safeMode: {
                safeModeTicks: roomController.safeMode || 0,
                cooldownTicks: roomController.safeModeCooldown || 0,
                activations: roomController.safeModeAvailable || 0,
            },
        };
    }

    return controller;
};

function scanData() {
    const sources = this.find(FIND_SOURCES).map(scanPos);
    const minerals = this.find(FIND_MINERALS).map(scanPos);
    const controller = scanController(this.controller);

    const makeFilter = x => {filter: {structureType: x}};
    const structs = _.groupBy(this.find(FIND_STRUCTURES), s => s.structureType);
    const ramps = (structs[STRUCTURE_RAMPART] || []).map(scanPosHits);
    const walls = (structs[STRUCTURE_WALL] || []).map(scanPosHits);
    const roads = (structs[STRUCTURE_ROAD] || []).map(scanPos);
    const meta = { writeTime: Game.time };

    const data = {
        walls: walls,
        roads: roads,
        ramps: ramps,
        sources: sources,
        minerals: minerals,
        meta: meta,
    };

    controller && (data.controller = controller);
    return data;
};

function updateData() {
    _.set(Memory, ['rooms', this.name, 'data'], this.scanData());
};

Room.prototype.drawColorMap = drawColorMap;
Room.prototype.scanData = scanData;
Room.prototype.updateData = updateData;
