const assert = require('assert');

class StateTransitionTable {
    constructor(table) {
        assert(table);
        this.table = table;
    };

    hasTransition(actionResult) {
        return actionResult in this.table;
    }

    lookup(actionResult) {
        assert(this.hasTransition(actionResult));
        return this.table[actionResult];
    };
};

module.exports = StateTransitionTable;
