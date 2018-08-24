'use strict';

const assert = require('assert');
const StateMachine = require('StateMachine');
const StateMachineRegistry = require('StateMachineRegistry');

class Task {
    constructor(fsm, initialStateId, data) {
        assert(fsm instanceof StateMachine);
        this.fsm = fsm;
        this.state = initialStateId;
        this.data = data;
    };

    run() {
        return this.fsm.run(this.state, this.data);
    };
};

function makeTask(name, initialStateId, data) {
    const fsm = StateMachineRegistry.get(name);
    return new Task(fsm, initialStateId, data);
};

module.exports = {
    'Task': Task,
    'makeTask': makeTask,
};
