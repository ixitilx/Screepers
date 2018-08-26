'use strict';

const assert = require('assert');
const StateMachine = require('StateMachine');
const StateMachineRegistry = require('StateMachineRegistry');

class Task {
    constructor(fsmName, state, data) {
        this.fsmName = fsmName;
        this.fsm = StateMachineRegistry.get(fsmName);
        this.state = state;
        this.data = data;
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

function loadTask(json) {
    assert('fsmName' in json);
    assert('state' in json);
    assert('data' in json);

    return new Task(json.fsmName, json.state, json.data);
};

module.exports = {
    'Task': Task,
    'makeTask': makeTask,
    'loadTask': loadTask,
};
