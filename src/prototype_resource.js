'use strict';

const logger = require('logger')
const Screeps = require('screeps')
const Empire = require('empire')

// Object.prototype.getDefault.call(Memory, 'resources')

Resource.prototype.getUnusedAmount = function(haulerCache)
{
    if(this._unusedAmount===undefined)
    {
        const validIds = _.filter(this.incomingHaulerIds, id => id in haulerCache)
        const usedAmount = _(validIds).map(id => Empire.getObjectById(id))
                                      .map(h => h.carryCapacity - h.carry)
                                      .sum()

        this._unusedAmount = Math.max(0, this.amount - usedAmount)
        logger.info('Calculated unused amount', this._unusedAmount)
    }
    return this._unusedAmount
}

Screeps.newMemoryProperty(Resource, () => [], 'incomingHaulerIds', 'resources')

// Resource.prototype.getUnusedAmount = function(haulerCache)
// {
//     const validIds = _(this.incomingHaulerIds).filter(id => id in haulerCache)
// }

// Object.defineProperty(Resource.prototype, 'memory', {
//     get: function(){return Object.prototype.getDefault.call(Memory.resources, this.id)},
//     set: function(value){Memory.resources[this.id]=value}
// })

// Object.defineProperty(Resource.prototype, 'incomingHaulerIds', {
//     get: function() {
//         if(!_.has(this.memory, 'incomingHaulerIds'))
//             this.memory.incomingHaulerIds = []
//         return this.memory.incomingHaulers
//     },
//     set: function(value){this.memory.incomingHaulerIds = value}
// })

// Object.defineProperty(Resource.prototype, 'unusedAmount', {
//     get: function() {
//         if(!_.has(this, '_unusedAmount'))
//             this._unusedAmount = getUnusedAmount(this)
//         return this._unusedAmount
//     }
// })
