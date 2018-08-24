const assert = require('assert');
const StateMachine = require('StateMachine');

class StateMachineBuilder {
    constructor() {
        this.fsm = new StateMachine({});
    };

    addState(stateId, action) {
        assert(!this.fsm.hasState(stateId));
        this.fsm.table[stateId] = new State(action, new StateTransitionTable());
        return this;
    };

    addTransition(stateId, actionResult, newStateId) {
        assert(this.fsm.hasState(stateId));
        assert(this.fsm.hasState(newStateId));

        const state = this.fsm.getState(stateId);
        const stateTransitionTable = state.table;
        assert(!stateTransitionTable.hasTransition(actionResult));

        stateTransitionTable.table[actionResult] = newStateId;
        return this;
    };

    create() {
        const fsm = this.fsm;
        delete this.fsm;
        return fsm;
    };
};

module.exports = StateMachineBuilder;
