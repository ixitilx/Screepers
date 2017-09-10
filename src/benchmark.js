'use strict';

const logger = require('logger')

exports.run = function(func, n=100)
{
    const start = Game.cpu.getUsed()
    _.times(n, func)
    const cpuUsed = Game.cpu.getUsed() - start
    return {avg:cpuUsed/n, total:cpuUsed}
}
