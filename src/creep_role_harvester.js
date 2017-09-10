'use strict';

const logger = require('logger')
const Empire = require('empire')

function harvesterCostCallback(roomName, costMatrix)
{
    const room = Game.rooms[roomName]
    if(!room)
        return

    const structs = _(room.structures)
        .filter(s => s.structureType != STRUCTURE_ROAD &&
                     s.structureType != STRUCTURE_CONTAINER)
        .map(s => s.pos)
        .value()

    let creeps = _(room.sources)
        .map(s => s.lookAround(LOOK_CREEPS))
        .flatten()
        .map(s => s.creep)
        .value()

    creeps = _(creeps)
        .filter(c => c.my && c.memory.role=='Harvester')
        .map(c => c.pos)
        .value()

    logger.json('harvesterCostCallback:', creeps)

    const all = _(structs).concat(creeps).value()
    // logger.json('harvesterCostCallback:', all)

    function avoid(p)
    {
        logger.warning('Avoiding', JSON.stringify(p))
        costMatrix.set(p.x, p.y, 255)
    }

    _.each(all, avoid)
}

function controlHarvester()
{
    const source = Empire.getObjectById(this.memory.sourceId)
    if(this.memory.move || ERR_NOT_IN_RANGE==this.harvest(source))
        this.checkedMoveTo(source.pos)//, harvesterCostCallback)
}

exports.run = controlHarvester
