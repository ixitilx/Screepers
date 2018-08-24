'use strict';

const assert = require('assert');

class StateTransitionTable {
    constructor(table) {
        assert(table);
        this.table = table;
    };

    hasTransition(actionResult) {
        console.log(JSON.stringify(this.table), actionResult);
        return actionResult in this.table;
    }

    lookup(actionResult) {
        assert(this.hasTransition(actionResult));
        return this.table[actionResult];
    };
};

module.exports = StateTransitionTable;
