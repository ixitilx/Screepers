'use strict';

const assert = require('assert');
const StateMachine = require('StateMachine');
const StateMachineRegistry = require('StateMachineRegistry');

class Task {
    constructor(fsmName, initialStateId, data) {
        assert(fsm instanceof StateMachine);
        this.fsmName = fsmName;
        this.fsm = StateMachineRegistry.get(fsmName);
        this.state = initialStateId;
        this.data = data;
    };

    constructor(json) {
        assert('fsmName' in json);
        assert('state' in json);
        assert('data' in json);

        this.fsmName = json.fsmName;
        this.fsm = StateMachineRegistry.get(fsmName);
        this.state = json.state;
        this.data = json.data;
    };

    dump() {
        return {
            fsmName: this.fsmName,
            state: this.state,
            data: this.data,
        };
    };

    run() {
        return this.state = this.fsm.run(this.state, this.data);
    };
};

function makeTask(name, initialStateId, data) {
    return new Task(name, initialStateId, data);
};

module.exports = {
    'Task': Task,
    'makeTask': makeTask,
};
