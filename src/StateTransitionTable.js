'use strict';

const assert = require('assert');

class StateTransitionTable {
    constructor(table) {
        assert(table);
        this.table = table;
    };

    hasTransition(actionResult) {
        console.log(JSON.stringify(this.table), actionResult);
        assert(actionResult === 0);

        return actionResult in this.table;
    }

    lookup(actionResult) {
        assert(this.hasTransition(actionResult));
        return this.table[actionResult];
    };
};

module.exports = StateTransitionTable;
