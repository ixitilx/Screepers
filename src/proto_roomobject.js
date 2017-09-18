'use strict';

function addMemory(proto, memoryName)
{
    if(!_.has(proto, 'memory'))
    {
        Object.defineProperty(proto, 'memory', {
            get: function() {
                if(_.isUndefined(Memory[memoryName]))
                    Memory[memoryName] = {}
                if(_.isUndefined(Memory[memoryName][this.id]))
                    Memory[memoryName][this.id] = {}
                return Memory[memoryName][this.id]
            },

            set: function(value) {
                this.memory = value
            }
        })
    }
}

addMemory(Structure.prototype, 'structures')
addMemory(Source.prototype, 'sources')
