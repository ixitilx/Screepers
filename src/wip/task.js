/**
    Код в Screeps выполняется каждый тик заново
    Однако, выполнять весь функционал "сначала" - непрактично и затратно
    В связи с этим, может быть выгодно организовать код в виде конечного
        автомата, где код имеет состояния и шаги
    Код загружает свое состояние из памяти, выполняет работу в соответствии с
        состоянием и сохраняет состояние назад в память
    
*/

class StateTransitionRecord {
    constructor() {

    }
}

class StateTransition {
    constructor(stateId, transitionHash) {
        this.stateId = stateId
        this.transitionHash = transitionHash
    }
}

class TransitionTable {
    constructor() {
        this.states = []
        this.transitionTable = []
    }

    getStateTransition(state, returnCode) {
        return state;
    }
}

class Task {
    constructor() {

    }

    run() {
        return exitCode;
    }
}

const fsm = {
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
}

class FiniteStateMachine {
    constructor() {
    }

    getTask(state) {
    }

    run(state) {
        const task = this.getTask(state);
        const returnCode = task.run();
        const newState = this.getStateTransition(state, returnCode);
    }
}
