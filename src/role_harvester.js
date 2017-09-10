const Screeps = require('screeps')
const Empire = require('empire')

global.ROLE_HARVESTER = 'harvester'

const roles = {
    harvester : {
        name : ROLE_HARVESTER,

        getBody : function(energy, source) {
            Screeps.assert(energy>=300)
            Screeps.assert(source instanceof Source)

            const body = {}
            body[MOVE]  = 1
            body[CARRY] = 1
            body[WORK]  = 2

            const cap = source.energyCapacity===SOURCE_ENERGY_NEUTRAL_CAPACITY ? SOURCE_ENERGY_CAPACITY : source.energyCapacity
            const maxWork = Math.ceil(cap / (ENERGY_REGEN_TIME * HARVEST_POWER))

            while( (energy-Screeps.bodyCost(body))>=250 && (body[WORK]+2)<=maxWork )
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
            Screeps.assert(source instanceof Source)
            return {
                role: ROLE_HARVESTER,
                sourceId: source.id
            }
        },

        isBelong: function(creep) {
            Screeps.assert(creep instanceof Creep)
            return creep.memory.role===ROLE_HARVESTER
        }

        act : function(creep) {
            Screeps.assert(creep instanceof Creep)

            const ret = creep.continue()
            if(ret!==OK)
                return ret

            const source = Game.getObjectById(creep.memory.sourceId)
            Screeps.assert(source instanceof Source)

            if(!creep.isNearTo(source.pos))
                return creep.checkedMoveTo(source.pos)
            return creep.harvest(source)
        }
    }
}

exports.roles = roles
