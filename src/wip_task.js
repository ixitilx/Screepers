var StateTransitionRecord = (function () {
    function StateTransitionRecord() {
    }
    return StateTransitionRecord;
}());
var StateTransition = (function () {
    function StateTransition(stateId, transitionHash) {
        this.stateId = stateId;
        this.transitionHash = transitionHash;
    }
    return StateTransition;
}());
var TransitionTable = (function () {
    function TransitionTable() {
        this.states = [];
        this.transitionTable = [];
    }
    TransitionTable.prototype.getStateTransition = function (state, returnCode) {
        return state;
    };
    return TransitionTable;
}());
var Task = (function () {
    function Task() {
    }
    Task.prototype.run = function () {
        return exitCode;
    };
    return Task;
}());
var fsm = {
    states: {
        stateA: {
            task: new Task(),
            transitions: {
                OK: stateB,
                ERR_FULL: stateC,
            }
        },
        stateB: {
            task: new Task(),
            transitions: {
                OK: stateA,
                ERR_FULL: stateC,
            }
        },
        stateC: {
            task: new Task(),
            transitions: {
                ANY: stateA,
            }
        }
    },
    stateData: {
        stateA: {
            somedata: 5
        }
    }
};
var FiniteStateMachine = (function () {
    function FiniteStateMachine() {
    }
    FiniteStateMachine.prototype.getTask = function (state) {
    };
    FiniteStateMachine.prototype.run = function (state) {
        var task = this.getTask(state);
        var returnCode = task.run();
        var newState = this.getStateTransition(state, returnCode);
    };
    return FiniteStateMachine;
}());
//# sourceMappingURL=task.js.map