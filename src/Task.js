const StateMachine = require('StateMachine');

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
