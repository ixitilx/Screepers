'use strict';

const assert = require('assert');

class State {
    constructor(action, table) {
        this.action = action;
        this.table = table;
    };

    lookup(actionResult) {
        console.log('State.lookup:', actionResult);
        return this.table.lookup(actionResult);
    };

    run(data) {
        const result = this.action(data);
        console.log('this.action:', result);
        return this.lookup(result);
    };
};

module.exports = State;
