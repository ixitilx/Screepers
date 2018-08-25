'use strict';

const assert = require('assert');

class StateMachine {
    constructor(table) {
        this.table = table;
    };

    getState(stateId) {
        assert(this.hasState(stateId));
        return this.table[stateId];
    };

    hasState(stateId) {
        return stateId in this.table;
    };

    lookup(stateId, actionResult) {
        const state = this.getState(stateId);
        return state.lookup(actionResult);
    };

    run(stateId, data) {
        const state = this.getState(stateId);
        const newStateId = state.run(data);
        console.log('StateMachine run(', stateId, '->', newStateId, ')');
        return newStateId;
    };
};

module.exports = StateMachine;
