'use strict';

const { defineProperty } = require('utils.prototype');

class Helper {
    constructor(creep) {
        this.creep = creep;
    };

    err(code, target, moveRange) {
        if (this.errFlag)
            throw new Error('Detected error processing recursion');

        switch(ret) {
            case OK:
            case ERR_TIRED:
            case ERR_BUSY:
                return OK;
            case ERR_NOT_IN_RANGE:
                if (moveRange >== 0) {
                    try {
                        this.errFlag = true;
                        return this.move(target, moveRange);
                    } finally {
                        delete this.errFlag;
                    }
                }
            default:
                return ret;
        };
    };

    move(pos, range=0) {
        const ret = this.creep.moveTo(pos, {
            range: range,
            plainCost: 2}
        );
        return this.err(ret, pos, range);
    };

    repair(target) {
        const ret = this.creep.repair(target);
        return this.err(ret, target.pos, 3);
    };

    transfer(target, res=RESOURCE_ENERGY, amount=undefined) {
        const ret = this.creep.transfer(target, res, amount);
        return this.err(ret, target.pos, 1);
    };

    harvest(target, pos=undefined) {
        if (pos instanceof RoomPosition) {
            if (!pos.isNear(target.pos))
                throw new Error(`Attempt ${this.creep} to harvest ${target} from ${pos}`);
            if (!pos.isEqual(this.creep.pos))
                return this.move(pos);
        }

        const ret = this.creep.harvest(target);
        return this.err(ret, target.pos, 1);
    };

    withdraw(target, res=RESOURCE_ENERGY, amount=undefined) {
        const ret = this.creep.withdraw(target, res, amount);
        return this.err(ret, target.pos, 1);
    };
};

function cargoSize() {
    return _.sum(this.carry);
};

function getTickCache() {
    if (('_tc' in this) === false)
        this._tc = {};
    return this._tc;
};

function getHelper() {
    if(('helper' in this.tick) === false)
        this.tick.helper = new Helper(this);
    return this.tick.helper;
};

defineProperty(Creep, 'carryNow', cargoSize);
defineProperty(Creep, 'tick', getTickCache);
defineProperty(Creep, 'helper', getHelper);
