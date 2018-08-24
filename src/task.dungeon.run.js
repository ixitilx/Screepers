'use strict';

const StateMachineBuilder = require('StateMachineBuilder');
const StateMachineRegistry = require('StateMachineRegistry');

function action(data) {
    console.log('task.dungeon.run');
    return 0;
};

const init = 'init';

const smb = new StateMachineBuilder();
smb.addState(init, action);
smb.addTransition(init, 0, init);
const fsm = smb.create();
console.log('fsm:');
console.log(JSON.stringify(fsm));

StateMachineRegistry.register('task.dungeon.run', fsm);
