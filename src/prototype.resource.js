'use strict';

const { defineProperty, assert } = require('utils.prototype');

function getEnergyLevel() {
    assert(this.resourceType === 'energy');
    return this.energy;
};

defineProperty(Resource, 'energyLevel', getEnergyLevel);
