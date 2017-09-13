'use strict';

const logger = require('logger')
const Empire = require('empire')
const Screeps = require('screeps')

function getUnusedEnergyCapacity()
{
    const storeCapacity = (this.store && this.storeCapacity && (this.storeCapacity - this.store[RESOURCE_ENERGY])) || 0
    const energyCapacity = (this.energy && this.energyCapacity && (this.energyCapacity - this.energy)) || 0
    logger.debug(this, 'store', storeCapacity, 'energy', energyCapacity)
    return storeCapacity + energyCapacity
}

Screeps.newTickProperty(Structure, getUnusedEnergyCapacity, 'unusedEnergyCapacity')
