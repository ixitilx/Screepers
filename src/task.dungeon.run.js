const StateMachineBuilder = require('StateMachineBuilder');
const StateMachineRegistry = require('StateMachineRegistry');

function action(data) {
    console.log('task.dungeon.run');
    return 0;
};

const states = {
    init: 'init'
};

const smb = new StateMachineBuilder();
smb.addState(states.init, action);
smb.addTransition(states.init, 0, states.init);

StateMachineRegistry.register('task.dungeon.run', smb.create());
