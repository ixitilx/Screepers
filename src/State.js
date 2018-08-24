const assert = require('assert');

class State {
    constructor(action, table) {
        this.action = action;
        this.table = table;
    };

    lookup(actionResult) {
        return this.table.lookup(actionResult);
    };

    run(data) {
        return this.lookup(this.action(data));
    };
};

module.exports = State;
