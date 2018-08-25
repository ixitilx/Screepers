'use strict';

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
        const actionResult = this.action(data);
        const newState = this.lookup(actionResult);
        console.log('State.run(', actionResult, ', ', newState, ')');
        return newState;
    };
};

module.exports = State;
