'use strict';
exports.getLogisticsQueue = getLogisticsQueue;
var order = {
    byFreeCapacity: function (structure) { return structure.energy - structure.energyCapacity; },
    byRemainingProgress: function (obj) { return obj.progress - obj.progressTotal; },
    byAmount: function (res) { return res.amount; },
    byEnergy: function (obj) { return obj.energy; },
};
var criteria = {
    isEnergyRes: function (res) { return (res.resourceType === RESOURCE_ENERGY); },
    isOtherStruct: function (str) { return (![STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER].includes(str.structureType)); },
    isEnergyUser: function (obj) { return !_.isUndefined(obj.energy) && !_.isUndefined(obj.energyCapacity); },
};
function getDroppedEnergyAround(pos) {
    return _(pos.lookAround(LOOK_RESOURCES))
        .map(function (rec) { return rec.resource; })
        .filter(criteria.isEnergyRes)
        .sortBy(order.byAmount)
        .value();
}
function getLogisticsQueue(room, data) {
    var structuresByType = _.groupBy(data.structures, 'structureType');
    var creepsByRole = _.groupBy(data.creeps, 'memory.role');
    function getItems(collection, key, filterCriteria, orderCriteria) {
        return _(_.get(collection, key, []))
            .filter((filterCriteria ? _.identity : filterCriteria))
            .sortBy((orderCriteria ? _.identity : orderCriteria))
            .value();
    }
    function getStructsByType(type) {
        return getItems(structuresByType, type, null, order.byFreeCapacity);
    }
    function getCreepsByTarget(role, targetId) {
        return getItems(creepsByRole, role, { memory: { targetId: targetId } }, order.byEnergy);
    }
    function siteNrg(site) {
        var siteWorkers = getCreepsByTarget(ROLE_WORKER, site.id);
        var eDrops = getDroppedEnergyAround(site.pos);
        return _(workers).concat(eDrops);
    }
    function contNrg(controller) {
        var workers = getCreepsByTarget(ROLE_WORKER, controller.id);
        var cont = controller.memory.containerId && Game.getObjectById(controller.memory.containerId);
        if (cont)
            workers.push(cont);
        return workers;
    }
    function sourceNrg(source) {
        var hrv = _(source.pos.lookAround(LOOK_CREEPS))
            .map(function (c) { return c.creep; })
            .filter(function (c) { return c.memory.role === ROLE_HARVESTER; })
            .filter(function (c) { return c.pos.isNearTo(source.pos); })
            .sortBy(order.byEnergy)
            .value();
        var nrg = getDroppedEnergyAround(source.pos);
        var cont = source.memory.containerId && Game.getObjectById(source.memory.containerId);
        return _(hrv).concat(cont ? cont : [], nrg).value();
    }
    var ext = getStructsByType(STRUCTURE_EXTENSION);
    var spn = getStructsByType(STRUCTURE_SPAWN);
    var twr = getStructsByType(STRUCTURE_TOWER);
    var bld = _(data.sites).map(siteNrg).flatten().value();
    var con = room.controller && room.controller.my ? contNrg(room.controller) : [];
    var cap = _(data.structures).filter(function (s) { return criteria.isOtherStruct(s) && criteria.isEnergyUser(s); })
        .sortBy(order.byFreeCapacity)
        .value();
    var trm = room.terminal && room.terminal.my ? [room.terminal] : [];
    var wll = _(data.structures).filter({ structureType: STRUCTURE_WALL })
        .map(function (wall) { return getCreepsByTarget(ROLE_WORKER, wall.id); })
        .flatten()
        .value();
    var rmp = _(data.structures).filter({ structureType: STRUCTURE_RAMPART })
        .map(function (rmp) { return getCreepsByTarget(ROLE_WORKER, rmp.id); })
        .flatten()
        .value();
    var nkr = _.filter(data.structures, { structureType: STRUCTURE_NUKER });
    var str = room.storage && room.storage.my ? [room.storage] : [];
    var src = _(data.sources).map(sourceNrg).flatten().value();
    var nrg = _(data.resources).filter(function (res) { return res.resourceType === RESOURCE_ENERGY; })
        .filter(function (res) { return !_.some(data.sources, function (s) { return s.pos.isNearTo(res.pos); }); })
        .sortBy(order.byAmount)
        .value();
    function makePriority(level, objects) {
        return { level: level, objects: objects };
    }
    var from = [
        makePriority(3, bld),
        makePriority(4, con),
        makePriority(5, cap),
        makePriority(6, trm),
        makePriority(10, str),
        makePriority(11, src),
        makePriority(12, nrg),
    ];
    var to = [
        makePriority(0, ext),
        makePriority(1, spn),
        makePriority(2, twr),
        makePriority(3, bld),
        makePriority(4, con),
        makePriority(5, cap),
        makePriority(6, trm),
        makePriority(7, wll),
        makePriority(8, rmp),
        makePriority(9, nkr),
    ];
    return [from, to];
}
function route(priorities, haulers) {
    var haulersByTarget = _.groupBy(haulers, 'memory.targetId');
    var fromIdx = _.size(priorities) - 1;
    var toIdx = 0;
    while (toIdx < fromIdx) {
        var fromPriority = priorities[fromIdx];
        if (fromPriority.from) {
            var sources = _.map(fromPriority.objects, function (s) { return ({ src: s, haulers: _.get(haulersByTarget, source.id, []) }); });
        }
    }
}
//# sourceMappingURL=room_logistics.js.map