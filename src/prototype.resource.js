'use strict';

const { defineProperty } = require('utils.prototype');

function getEnergyLevel() {
    assert(this.resourceType === 'energy');
    return this.energy;
};

defineProperty(Resource, 'energyLevel', getEnergyLevel);
