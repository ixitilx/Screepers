'use strict';

const logger = require('logger')

const roles = new Object()

function getRoleLoader(role)
{
    return function()
    {
        logger.info('Loading creep role', role)
        return require('creep_role_' + role.toLowerCase())
    }
}

Creep.prototype.manage = function()
{
    const manager = roles.getDefault(this.memory.role, getRoleLoader(this.memory.role))
    return manager.run.call(this)
}
