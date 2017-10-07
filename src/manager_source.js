'use strict';
var assert = require("assert");
var constants = require("constants");
exports.manage = manage;

var VERSION = 3;

function manage(source) {
    assert.Defined(source);
    if (source.memory.version !== VERSION) {
        delete source.memory;
        initialize(source);
    }
    var needMoreHarvesters = manageHarvest(source);
    var hasEnergy = manageHauling(source);

    draw(source);

    var needCreeps = [];
    if (needMoreHarvesters)
        needCreeps.push(ROLE_HARVESTER);

    if (hasEnergy > 0)
        needCreeps.push(ROLE_HAULER);

    return { needCreeps: needCreeps, hasEnergy: hasEnergy };
}

function manageHarvest(source) {
    var spots = _.map(source.memory.spots, RoomPosition.deserialize);
    assert.Defined(spots);
    var harvs = _.filter(Game.creeps, { memory: { targetId: source.id, role: ROLE_HARVESTER } });
    var needWork = Math.ceil(source.energyCapacity / (HARVEST_POWER * ENERGY_REGEN_TIME));
    var hasWork = _(harvs).map('body').flatten().filter(function (part) { return part === WORK; }).size();
    var harvCount = _.size(harvs);
    var spotCount = _.size(spots);
    var hsZip = _.take(_.zip(harvs, spots), Math.min(harvCount, spotCount));
    _.each(hsZip, function (_a) {
        var harv = _a[0], spot = _a[1];
        return manageHarvester(source, harv, spot);
    });
    return hasWork < needWork && harvCount < spotCount;
}

function manageHarvester(source, harv, spot) {
    if (!harv.pos.isEqualTo(spot))
        harv.moveTo(spot);
    else
        harv.harvest(source);
}

function initialize(source) {
    console.log("Initializing " + source);
    initializeSpots(source);
    initializeContainerPos(source);
    initializeContainer(source);
    source.memory.version = VERSION;
}

function initializeSpots(source) {
    var spots = _(source.pos.lookAround(LOOK_TERRAIN))
        .filter(function (t) { return t.terrain !== TERRAIN_WALL; })
        .map('pos').value();
    assert.True(_.size(spots) > 0);
    source.memory.spots = spots;
}

function initializeContainerPos(source) {
    var spots = source.memory.spots;
    var baseRoom = source.room.baseRoom;
    var spawns = _.filter(Game.spawns, function (s) { return s.pos.roomName === baseRoom.name; });
    assert.True(_.size(spawns) > 0);
    var path = PathFinder.search(spawns[0].pos, spots[0]).path;
    var isNearSpot = function (pos) { return _.any(spots, function (s) { return s.isNearTo(pos); }); };
    var notNearSpotsIdx = _(path).findLastIndex(function (step) { return !isNearSpot(step); });
    assert.True(notNearSpotsIdx !== -1);
    var containerPos = path[notNearSpotsIdx + 1];
    source.memory.containerPos = containerPos;
    _.each(spots, function (s) { return s.range = Math.abs(s.x - containerPos.x) + Math.abs(s.y - containerPos.y); });
    _.sortBy(spots, 'range');
}

function initializeContainer(source) {
    var structs = source.memory.containerPos.lookAround(LOOK_STRUCTURES, 0);
    var cont = _(structs).filter({ structureType: STRUCTURE_CONTAINER }).first();
    if (cont)
        source.memory.containerId = cont.id;
    var sites = source.memory.containerPos.lookAround(LOOK_CONSTRUCTION_SITES, 0);
    var site = _(sites).filter({ my: true, structureType: STRUCTURE_CONTAINER }).first();
    if (site)
        source.memory.containerSiteId = site.id;
}

function draw(source) {
    var _this = source;
    _.each(source.memory.spots, function (s) { return _this.room.visual.circle(s.x, s.y, { fill: '#00FF00' }); });
    source.room.visual.circle(this.memory.containerPos, { fill: '#208020', radius: 0.3 });
}

function manageHauling() {
    var haulers = _.filter(Game.creeps, { memory: { targetId: this.id, role: ROLE_HAULER } });
    var eDrops = _.filter(this.pos.lookAround(LOOK_RESOURCES), { resourceType: RESOURCE_ENERGY });
    var harvsOnPosition = _.filter(this.pos.lookAround(LOOK_CREEPS), { my: true, memory: { role: ROLE_HARVESTER } });
    var cont = this.memory.containerId && Game.getObjectById(this.memory.containerId);
    manageHaulers.call(this, haulers, eDrops, harvsOnPosition, cont);
    var eDropsEnergy = _(eDrops).map('amount').sum();
    var harvsEnergy = _(harvsOnPosition).map(function (h) { return h.carry[RESOURCE_ENERGY]; }).sum();
    var contEnergy = (cont && cont.store && cont.store[RESOURCE_ENERGY]) ? cont.store[RESOURCE_ENERGY] : 0;
    var hasEnergyTotal = eDropsEnergy + harvsEnergy + contEnergy;
    var toWithdrawTotal = _(haulers).map(function (h) { return h.carryCapacity - _.sum(h.carry); }).sum();
    var hasEnergy = hasEnergyTotal - toWithdrawTotal;
    return hasEnergy;
}

function manageHaulers(haulers, eDrops, harvsOnPosition, cont) {
    var eDropIdx = 0;
    var harvIdx = 0;
    var pickedUp = 0;
    _.each(haulers, function (hauler) {
        while (pickedUp === 0 && eDropIdx < _(eDrops).size()) {
            var eDrop = eDrops[eDropIdx];
            if (hauler.pos.isNearTo(eDrop.pos)) {
                var ret = hauler.pickup(eDrop);
                if (ret === OK) {
                    eDropIdx++;
                    pickedUp = eDrop.amount;
                    break;
                }
                throw new Error(hauler + ".pickup(" + eDrop + ") => " + ret);
            }
            else {
                hauler.moveTo(eDrop);
                return true;
            }
        }
        while (pickedUp === 0 && harvIdx < _(harvsOnPosition).size()) {
            var harv = harvsOnPosition[harvIdx];
            if (_.sum(harv.carry) < harv.carryCapacity) {
                harvIdx++;
                continue;
            }
            harv.transfer(hauler, RESOURCE_ENERGY);
            harvIdx++;
            pickedUp = harv.carry[RESOURCE_ENERGY];
            break;
        }
        if (pickedUp === 0 && cont) {
            var ret = hauler.withdraw(cont, RESOURCE_ENERGY);
            if (ret === OK)
                pickedUp = cont.store[RESOURCE_ENERGY];
        }
        if ((_.sum(hauler.carry) + pickedUp) >= hauler.carryCapacity)
            delete hauler.memory.targetId;
        return true;
    });
}

//# sourceMappingURL=source.js.map
