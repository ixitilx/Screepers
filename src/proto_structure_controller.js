'use strict';

const assert = require('assert')

function getContainerPos() {
    const controller = this;
    const room = controller.room;
    const spawn = Game.spawns.Spawn1;
    var isPassable = function (t) { return t.terrain !== TERRAIN_WALL; };
    var terrain = _.filter(controller.pos.lookAround(LOOK_TERRAIN, 3), isPassable);
    var terrainPos = _.map(terrain, 'pos');
    _.each(terrainPos, function (t) { return t.score = _(terrainPos).filter(function (tt) { return t.isNearTo(tt); }).size(); });
    var maxScore = _(terrainPos).map('score').max();
    var minScore = _(terrainPos).map('score').min();
    var weight = function (s) { return (s - minScore) / (maxScore - minScore); };
    var pad2 = function (s) { return ('00' + s).slice(-2); };
    var red = function (s) { return pad2(Math.ceil(255 * (1 - weight(s))).toString(16)); };
    var green = function (s) { return pad2(Math.ceil(255 * weight(s)).toString(16)); };
    var color = function (s) { return '#' + red(s) + green(s) + '00'; };
    _.each(terrainPos, function (t) { return controller.room.visual.circle(t.x, t.y, { fill: color(t.score) }); });
    var contPos = _(terrainPos).filter(function (t) { return t.score === maxScore; })
        .sortBy(function (t) { return room.findPath(t, spawn.pos, { ignoreCreeps: true }).length; })
        .first();
    controller.room.visual.circle(contPos.x, contPos.y, { fill: '#00FF00', radius: 0.3 });
    return RoomPosition.deserialize(contPos);
}

function containerPos() {
    if(!this.memory.containerPos)
        return this.memory.containerPos = getContainerPos.call(this);
    if(!(this.memory.containerPos instanceof RoomPosition))
        return this.memory.containerPos = RoomPosition.deserialize(this.memory.containerPos);
    return this.memory.containerPos;
}

Object.defineProperty(StructureController.prototype, 'containerPos', {get:containerPos});
