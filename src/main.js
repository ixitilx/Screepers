'use strict';

require('prototype')
const logger = require('logger')

logger.debug('### Fresh start')
updateRespawnTime()

function loop()
{
    try
    {
        const start = Game.cpu.getUsed()

        cleanupMemory()

        PathFinder.use(true)

        let [busy, free] = _.partition(Game.creeps, c => c.manager)
        logger.trace('loop', 'busy', busy)
        busy = _.groupBy(busy, c => c.managerId)

        logger.trace('loop', 'free', free)

        const rooms = _(Game.rooms).sortBy('energyCapacityAvailable').reverse().value()

        _.each(rooms, r => r.plan(busy, free))
        _.each(rooms, r => r.run(busy))
                     // .map(r => r.plan(busy, free))
                     // .value()

        stats(start)
        logger.restoreLoglevel()
    }
    catch(e)
    {
        logger.fallbackToTrace()
        throw e
    }
    finally
    {
        _.each(Game.creeps, c => c.memory.lastPos=c.pos)
    }
}

function cleanupMemory()
{
    // Cleanup creeps
    _(Memory.creeps).keys()
                    .filter(k => !(k in Game.creeps))
                    .map(k => delete Memory.creeps[k])
                    .value()
}

function updateRespawnTime()
{
    if ( (_.size(Game.structures)==2 &&
          _.size(Game.rooms)==1 && _.size(Game.spawns)==1 && 
          _.size(Game.creeps)==0) ||
          Memory._respawned===undefined)
    {
        logger.debug('### Respawn detected')
        Memory._respawned = Game.time
    }
        
    return Memory._respawned
}

function stats(start)
{
    const cpuUsed = Game.cpu.getUsed()
    const cpuPercent = Math.round(cpuUsed / Game.cpu.limit * 100)
    const cpuUsed2 = Math.round(cpuUsed * 100) / 100
    logger.debug(
        '--- Tick finished.',
        'CPU:',  cpuPercent + '% ('+ cpuUsed2 + '(' + Math.ceil(start*100)/100 + ')/' + Game.cpu.limit + '/' + Game.cpu.bucket + ')')
}

exports.loop = loop
