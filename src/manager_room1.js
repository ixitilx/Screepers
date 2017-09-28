'use strict';
var assert = require("assert");
var source_manager = require("source_manager");
var BaseConstructionManager = require("manager_base_construction");
var ControllerUpgradeManager = require("manager_controller_upgrade");
exports.manage = manage;
var BaseManager = (function () {
    function BaseManager(controller) {
        assert.Defined(controller);
        assert.InstanceOf(controller, StructureController);
        this.controller = controller;
    }
    BaseManager.prototype.manage = function () {
        if (!this.controller.my)
            return;
        BaseConstructionManager.manage(this.controller.room);
        ControllerUpgradeManager.manage(this.controller);
    };
    return BaseManager;
}());
function manage(room, info) {
    new BaseManager(room.controller).manage();
    updateRoomInfo(room, info);
    var sourceStatus = _.map(info.sources, function (s) { return ({ obj: s, status: source_manager.manage.call(s) }); });
    drawRoads(room);
    var harvesterBody = ['mcww', 'mw?', 'w?', 'mw?', 'w?'];
    var haulerBody = 'mcc+';
    var workerBody = ['mcw', 'mww*', 'mw?'];
}
function drawRoads(room) {
    var spawns = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
    var controller = room.controller;
    var sources = room.find(FIND_SOURCES);
    var minerals = room.find(FIND_MINERALS);
    var roads = {};
    var roadMatrix = new PathFinder.CostMatrix();
    function callback(roomName) {
        if (!(roomName in Game.rooms))
            return false;
        if (roomName === room.name)
            return roadMatrix;
        return true;
    }
    function newRoad(from, to, range) {
        assert.Equal(from.roomName, room.name);
        assert.Equal(to.roomName, room.name);
        var origin = from;
        var goal = {
            pos: to,
            range: range
        };
        var opts = {
            roomCallback: callback,
            plainCost: 2,
            swampCost: 10
        };
        var ret = PathFinder.search(origin, goal, opts);
        var path = ret.path;
        function updateRoad(pos) {
            var name = pos.serialize();
            if (name in roads)
                return;
            roads[name] = { pos: pos, idx: _.size(roads) };
        }
        _.each(path, updateRoad);
        _.each(path, function (step) { return roadMatrix.set(step.x, step.y, 1); });
    }
    _.each(spawns, function (spawn) { return newRoad(spawn.pos, controller.pos, 1); });
    _.each(spawns, function (spawn) { return _.each(sources, function (source) { return newRoad(spawn.pos, source.pos, 1); }); });
    _.each(spawns, function (spawn) { return _.each(minerals, function (minerals) { return newRoad(spawn.pos, minerals.pos, 1); }); });
    _.each(roads, function (r) { return room.visual.circle(r.pos, { radius: 0.1, fill: '#0080FF' }); });
}
var energyProviderPriorities = [
    STRUCTURE_CONTAINER,
    STRUCTURE_LINK,
    STRUCTURE_TERMINAL,
    STRUCTURE_STORAGE
];
var energyConsumerPriorities = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_TERMINAL,
    STRUCTURE_LAB,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_NUKER,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
];
function updateRoomInfo(room, info) {
    info.sources = room.find(FIND_SOURCES);
}
//# sourceMappingURL=room1.js.map