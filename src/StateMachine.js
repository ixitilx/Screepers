class StateTransitionTable {
    constructor(table) {
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

class State {
    constructor(action, table) {
        this.action = action;
        this.table = table;
    };

    lookup(actionResult) {
        return this.table.lookup(actionResult);
    };

    run(data) {
        return lookup(this.action(data));
    };
};

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
    }

    lookup(stateId, actionResult) {
        const state = this.getState(stateId);
        return state.lookup(actionResult);
    };

    run(stateId, data) {
        const state = this.getState(stateId);
        const actionResult = state.run(data);
        return state.lookup(actionResult);
    };
};

// exports = State;
// exports = StateTransitionTable;
module.exports = StateMachine;
