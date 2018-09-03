'use strict';

const {assert} = require('utils.prototype');

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

class Plan {
    static encode(objectType) {
        const ret = planEncodeMap[objectType];
        if (ret)
            return ret;
        throw new Error(`Unknown object type: ${objectType}`);
    };

    static decode(planChar) {
        const ret = planDecodeMap[planChar];
        if (ret)
            return ret;
        throw new Error(`Unknown plan character: ${planChar}`);
    };
};

function mapIndex(x, y) {
    assert(x && y, `Invalid coordinates: ${x}, ${y}`);
    return 50*y + x;
};

function unmapIndex(idx) {
    assert(0 <= idx && idx < 50*50, `Index is outside of the room: ${idx}`);
    return {x: (idx % 50), y: Math.floor(idx/50)};
};

function mapLookup(roomMap, x, y) {
    return roomMap[mapIndex(x, y)];
};

function buildTerrainMap(room) {
    return _(room.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 49, true))
                .sortBy(rec => 50*rec.y + rec.x)
                .map(rec => Plan.encode(rec.terrain))
                .value()
                .join('');
};

function isInRoom(p) {
    return (0 <= p.x && p.x < 50) && (0 <= p.y && p.y < 50);
};

function posAround(p) {
    const out = [];
    _.each([-1, 0, 1], dy =>
        _.each([-1, 0, 1], dx =>
            out.push({x: p.x + dx, y: p.y + dy})));
    return _.filter(out, isInRoom);
};

function buildDistanceMap(positions, terrainMap) {
    if (!_.isArray(positions) && positions.x && positions.y)
        positions = [positions];

    const out = Array.from({length: 2500}, (v) => -1);
    
    let queue = _.map(positions, p => _.pick(p, ['x', 'y']));
    let score;
    for (score = 0; queue.length > 0; score++) {
        _.each(queue, q => out[mapIndex(q.x, q.y)] = score);
        queue = _(queue).map(p => posAround(p)).flatten();
        console.log('buildDistanceMap', score, JSON.stringify(queue));
        queue = _.uniq(queue, false, p => mapIndex(p.x, p.y));
        queue = _(queue).filter(p => mapLookup(terrainMap, p.x, p.y) !== '#')
                        .filter(p => mapLookup(out, p.x, p.y) === -1)
                        .value();
        if (Game.cpu.getUsed() > 5)
            break;
    };

    return {distanceMap: out, maxScore: score-1};
};

function hexColorFromWeight(weight) {
    const color = Math.min(255, Math.max(256 * weight, 0));
    return color.toString(16);
};

function colorFromWeight(weight) {
    assert(0 <= weight && weight < 1, `Weight is out of range: ${weight}`);
    const invWeight = 1.0 - weight;
    return `#${hexColorFromWeight(invWeight)}${hexColorFromWeight(weight)}00`;
};

function drawDistanceMap(room, distanceMap, maxScore) {
    const circles = _(distanceMap).map(function(v, i) {
                                          const {x, y} = unmapIndex(i);
                                          const weight = v / maxScore;
                                          return {x: x, y: y, w: v};
                                       })
                                  .filter(obj => obj.w >= 0)
                                  .map(obj => ({x: obj.x, y: obj.y, c: colorFromWeight(obj.w/maxScore)}) )
                                  .each(obj => room.visual.circle(obj.x, obj.y, {fill: obj.c}))
                                  .value();
};

const tm_ = {};

function drawSomething(room) {
    const terrainMap = room.name in tm_ ? tm_[room.name] : tm_[room.name] = buildTerrainMap(room);
    console.log(Game.cpu.getUsed());
    const {distanceMap, maxScore} = buildDistanceMap(room.controller.pos, terrainMap);
    console.log(Game.cpu.getUsed(), maxScore);
    drawDistanceMap(room, distanceMap, maxScore);
    console.log(Game.cpu.getUsed());
};

module.exports = drawSomething;