const Screeps = require('screeps')
const Empire = require('empire')

global.ROLE_HARVESTER = 'roles.harvester'

class CreepRole
{
    constructor() {
    }

    static name = { get: () => 'creep' }

    static getNewCreepBody(energy) {
    }

    static getNewCreepMemory() {
    }

    static isBelong(creep) {
    }
}

class CreepRoleHarvester extends CreepRole
{
    constructor() {}
    static getBody(energy, source) {
        Screeps.assert(energy>=300)
        Screeps.assertType(source, Source)

        const body = {}
        body[MOVE]  = 1
        body[CARRY] = 1
        body[WORK]  = 2

        const cap = source.energyCapacity===SOURCE_ENERGY_NEUTRAL_CAPACITY ? SOURCE_ENERGY_CAPACITY : source.energyCapacity
        const maxWork = Math.ceil(cap / (ENERGY_REGEN_TIME * HARVEST_POWER))

        while( (energy-Screeps.bodyCost(body)) >= 250 && (body[WORK]+2)<=maxWork )
        {
            body[WORK] += 2
            body[MOVE] += 1
        }

        if(energy-Screeps.bodyCost(body) >= 150 && (body[WORK]+1)<=maxWork)
        {
            body[WORK] += 1
            body[MOVE] += 1
        }

        Screeps.assert(2*body[MOVE] >= body[WORK])
        return Screeps.buildCreepBodyArray(body)
    },

    getMemory : function(source) {
        Screeps.assertType(source, Source)
        return {
            role: ROLE_HARVESTER,
            actions: [new actions.harvest(source)]
        }
    },

    isBelong : function(creep) {
        Screeps.assertType(creep, Creep)
        return creep.memory.role===ROLE_HARVESTER
    }


}

const roles = {
    harvester : {
        name : ROLE_HARVESTER,

        act : function(creep) {
            Screeps.assertType(creep, Creep)

            const ret = creep.continue()
            if(ret!==OK)
                return ret

            const source = Game.getObjectById(creep.memory.sourceId)
            Screeps.assertType(source, Source)

            if(!creep.isNearTo(source.pos))
                return creep.checkedMoveTo(source.pos)
            return creep.harvest(source)
        }

        // onSpawn : function(creep) {
        // }

        // onDie : function(creep) {
        // }
    }
}

exports.roles = roles
