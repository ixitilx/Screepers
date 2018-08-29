'use strict';

const { defineProperty } = require('utils.prototype');

function cargoSize() {
    return _.sum(this.carry);
};

defineProperty(Creep, 'carryNow', cargoSize);
