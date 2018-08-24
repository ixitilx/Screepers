const assert = require('assert');
const StateMachine = require('StateMachine');

class StateMachineRegistry {
    constructor() {
        this.registry = {};
    };

    isRegistered(stateMachineId) {
        return stateMachineId in this.registry;
    };

    register(stateMachineId, stateMachine) {
        assert(!this.isRegistered(stateMachineId));
        assert(stateMachine instanceof StateMachine);
        this.registry[stateMachineId] = stateMachine;
    };

    get(stateMachineId) {
        assert(this.isRegistered(stateMachineId));
        return this.registry[stateMachineId];
    };
};

const smr = new StateMachineRegistry();

module.exports = smr;
