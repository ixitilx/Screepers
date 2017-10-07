'use strict';
var assert = require("assert");
var constants = require("constants");

exports.manage = manage;

function manage(room, info) {
    assert.Equal(_.size(Game.spawns), 1);
    var spawn = _(Game.spawns).toArray().first();
    var sources = room.find(FIND_SOURCES);
    _.each(sources, function (s) { return sourceHarvest(room, s, spawn); });
    controllerUpgrade(room, spawn);
    var harvesters = _.filter(Game.creeps, function (c) { return c.memory.role === ROLE_HARVESTER; });
    _.each(harvesters, function (h) { return creepHarvest(h); });
}

function sourceHarvest(room, source, spawn) {
    assert.Equal(room.name, source.room.name);
    assert.Equal(room.name, spawn.room.name);
    var terrain = source.pos.lookAround(LOOK_TERRAIN);
    var spots = _(terrain).filter(function (t) { return t.terrain !== TERRAIN_WALL; })
        .map('pos')
        .value();
    var harvesters = _.filter(Game.creeps, function (c) { return c.memory.role === ROLE_HARVESTER
        && c.memory.targetId === source.id; });
    var workHas = _(harvesters).map(function (h) { return h.body; })
        .flatten()
        .filter(function (part) { return part.type === WORK; })
        .size();
    var countHas = _.size(harvesters);
    var countMax = _.size(spots);
    var workMax = source.energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME);
    if (countHas < countMax && workHas < workMax && !spawn.spawning && _.isUndefined(spawn.queued)) {
        console.log(source, "work: " + workHas + "/" + workMax + ", count: " + countHas + "/" + countMax);
        function getHarvesterBody() { return [WORK, WORK, CARRY, MOVE]; }
        function getHarvesterMemory(source) { return { role: ROLE_HARVESTER, targetId: source.id }; }
        var body = getHarvesterBody();
        var memory = getHarvesterMemory(source);
        var ret = spawn.createCreep(body, null, memory);
        var formatRet = function (ret) { return typeof (ret) === 'string' && Game.creeps[ret] ? Game.creeps[ret] : ret; };
        console.log(source + ": spawn.createCreep(" + body + ") => " + formatRet(ret));
        if (typeof (ret) === 'string')
            spawn.queued = true;
    }
    return true;
}

function creepHarvest(creep) {
    var source = Game.getObjectById(creep.memory.targetId);
    var ret = creep.harvest(source);
    if (ret === OK)
        return;
    if (ret === ERR_NOT_IN_RANGE)
        return creep.moveTo(source, { reusePath: 5, serializeMemory: true });
    var sites = source.pos.lookAround(LOOK_CONSTRUCTION_SITES, 3);
    if (_.size(sites)) {
        var toSite = function (r) { return r.constructionSite; };
        var site = toSite(_(sites).first());
        var energyNeedForBuild = BUILD_POWER * _(creep.body).map(function (part) { return part.type === WORK; }).sum();
        if (creep.carry[RESOURCE_ENERGY] >= energyNeedForBuild) {
            var ret_1 = creep.build(site);
        }
        var resources = creep.pos.lookAround(LOOK_RESOURCES);
        if (_.size(resources)) {
            var toResource = function (r) { return r.resource; };
            var res = toResource(_(resources).first());
            creep.pickup(res);
        }
    }
}

function whatToBuild(rcl, structures) {
    var current = _.countBy(structures, function (s) { return s.structureType; });
    function iteratee(type) {
        var structuresNow = current[type] === undefined ? 0 : current[type];
        var structuresRcl = CONTROLLER_STRUCTURES[type][rcl];
        var structuresToDo = structuresRcl - structuresNow;
        if (structuresToDo > 0)
            return { type: type, count: structuresToDo };
        { }
    }
    var todo = _(buildPriority).map(iteratee).filter(function (item) { return item && item.count; }).value();
    console.log(JSON.stringify(todo));
    return todo;
}

function roomBuild(room) {
    var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (_.size(sites) > 0)
        return;
    var structures = room.find(FIND_MY_STRUCTURES);
    var spawns = _.filter(structures, structureType === STRUCTURE_SPAWN);
    if (_.size(spawns) === 1) {
        var spawn = spawns[0];
        if (_.isUndefined(spawn.memory.containerId)) {
            var container = _(spawn.pos.lookAround(LOOK_STRUCTURES))
                .map(function (rec) { return rec.structure; })
                .filter({ structureType: STRUCTURE_CONTAINER })
                .first();
            if (container) {
                spawn.memory.containerId = container.id;
            }
            else {
            }
        }
    }
    var extensions = _.filter(structures, function (s) { return s.structureType === STRUCTURE_EXTENSION; });
    var extensionCount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level] - _.size(extensions);
    if (extensionCount > 0) {
    }
    if (room.controller && room.controller.my && room.controller.level < 4) {
    }
}

function controllerUpgrade(room, spawn) {
    var controller = room.controller;
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
    var structures = contPos.lookFor(LOOK_STRUCTURES);
    if (_.size(structures) === 0) {
        var sites = 0;
    }
}
//# sourceMappingURL=room.js.map