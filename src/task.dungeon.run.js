'use strict';

const StateMachineBuilder = require('StateMachineBuilder');
const StateMachineRegistry = require('StateMachineRegistry');

function log1(data) {
    console.log('task.dungeon.run:log1');
    return (Game.time % 13) === 0 ? 1 : 0;
};

function log2(data) {
    console.log('task.dungeon.run:log2');
    return (Game.time % 17) === 0 ? 1 : 0;
};

const init = 'init';
const flip = 'flip';

const smb = new StateMachineBuilder();
smb.addState(init, log1);
smb.addState(flip, log2);
smb.addTransition(init, 0, init);
smb.addTransition(init, 1, flip);
smb.addTransition(flip, 0, flip);
smb.addTransition(flip, 1, init);
const fsm = smb.create();

StateMachineRegistry.register('task.dungeon.run', fsm);
