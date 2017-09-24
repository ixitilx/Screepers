'use strict';

const assert = require('assert')

function addMemory(proto, memoryName)
{
    if(!_.has(proto, 'memory'))
    {
        Object.defineProperty(proto, 'memory', {
            get: function() {
                if(_.isUndefined(Memory[memoryName]))
                    Memory[memoryName] = {}
                if(_.isUndefined(Memory[memoryName][this.id]))
                    Memory[memoryName][this.id] = {_created: Game.time}
                Memory[memoryName][this.id]._lastUsed = Game.time
                return Memory[memoryName][this.id]
            },

            set: function(value) {
                assert(typeof(value) === 'object')
                value._created = this.memory._created
                value._lastUsed = this.memory._lastUsed
                this.memory = value
            }
        })
    }
}

exports.addMemory = addMemory
