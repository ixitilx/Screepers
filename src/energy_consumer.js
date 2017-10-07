'use strict';

const assert = require('assert');

function getCreepHasEnergy() { return this.obj.carry[RESOURCE_ENERGY]; }
function getCreepNeedEnergy() { return this.obj.carryCapacity - _.sum(this.obj.carry); }

function getContHasEnergy() { return this.obj.store[RESOURCE_ENERGY]; }
function getContNeedEnergy() { return this.obj.storeCapacity - _.sum(this.obj.store); }

function getStructHasEnergy() { return this.obj.energy; }
function getStructNeedEnergy() { return this.obj.energyCapacity - this.obj.energy; }

function getPileHasEnergy() { return this.obj.resourceType === RESOURCE_ENERGY ? this.obj.amount : 0; }



function unloadCreepTransfer(creep) { return creep.transfer(this.obj, RESOURCE_ENERGY); }

function unloadCreepDrop(creep) {
    if(!creep.pos.isEqualTo(this.obj))
        return ERR_NOT_IN_RANGE;
    return creep.drop(RESOURCE_ENERGY);
}

function loadCreepTransfer(creep) { return this.obj.transfer(creep); }
function loadCreepWithdraw(creep) { return creep.withdraw(this.obj, RESOURCE_ENERGY); }
function loadCreepPickup  (creep) { return creep.pickup(this.obj); }

class EnergyUser {
    constructor(obj) {
        this.obj = obj;
        assert.Defined(obj.memory);

        if (obj instanceof Creep) {
            this.hasEnergy = getCreepNeedEnergy;
        } else if(obj instanceof StructureContainer ||
                  obj instanceof StructureLink      ||
                  obj instanceof StructureStorage) {
            this.energyLevel = getContNeedEnergy;
        } else if(obj instanceof Structure &&
                  !_.isUndefined(obj.energyCapacity)) {
            this.energyLevel = getStructNeedEnergy;
        } else {
            throw new Error(`Cannot initialize EnergyConsumer for ${obj}. ${JSON.stringify(obj)}`);
        }
    }

    get memory() {
        if(_.isUndefined(this.obj.memory.energyConsumer))
            this.obj.memory.energyConsumer = {};
        return this.obj.memory.energyConsumer;
    }

    get incomingCreeps() {
        if(_.isUndefined(this._incomingCreeps)) {
            if(_.isUndefined(this.memory.incomingCreepIds))
                this.memory.incomingCreepIds = [];
            this._incomingCreeps = _(this.memory.incomingCreepIds).map(Game.getObjectById)
                                                                  .indexBy('id')
                                                                  .value();
        }
        return this._incomingCreeps;
    }

    get energyLevelAvailable() {
        const incomingEnergy = _(this.incomingCreeps).map(getCreepHasEnergy).sum();
        return this.energyLevel - incomingEnergy;
    }

    unloadCreep(creep) {
        return 0;
    }
};
