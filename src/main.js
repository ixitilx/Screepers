'use strict';

require('prototype')

const logger = require('logger')

updateRespawnTime()

logger.debug('### Fresh start')

function loop()
{
    try
    {
        const start = Game.cpu.getUsed()

        _.each(Game.creeps, c => c.manage())
        _(Game.rooms).sortBy('energyCapacityAvailable')
                     .reverse()
                     .map(r => r.manage())
                     .value()
        _.each(Game.spawns, s => s.manage())

        // sources_update_known.run()
        // _.each(sources_prioritize.run(), source_manage.run)
        // spawns_manage.run()
        
        stats(start)
        logger.restoreLoglevel()
    }
    catch(e)
    {
        logger.fallbackToTrace()
        throw e
    }
}

function updateRespawnTime()
{
    if ( (_.size(Game.structures)==2 &&
          _.size(Game.rooms)==1 && _.size(Game.spawns)==1 && 
          _.size(Game.creeps)==0) ||
         (!_.has(Memory, 'data.respawnTick')) )
    {
        logger.debug('### Respawn detected')
        _.set(Memory, 'data.respawnTick', Game.time)
    }
        
    return Memory.data.respawnTick
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
