'use strict';

const assert = require('assert');

/**
    Objective:
        upgrade controller
            deliver energy
            bring workers
            build container

    Concept:
*/

class GameDispatcher {
    constructor() {
    }

    getCreeps(filter) {
        return _.filter(Game.creeps, filter);
    }
};

function manage(controller) {
    const dispatcher = new GameDispatcher();
    const workers = dispatcher.getCreeps({memory: {role:ROLE_WORKER, targetId:controller.id}});
    _.each(workers, c => c.upgradeController(this));
}

// function manageUpgrader(creep, controller, )

exports.manage = manage
