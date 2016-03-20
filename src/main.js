var harvester = require('harvester')
var builder = require('builder')

module.exports.loop = function () {
    for(var name in Game.creeps)
    {
    	var creep = Game.creeps[name];
    	if(creep.memory.role == 'harvester') {
    	    harvester.move(creep)
    	}
    	
    	if(creep.memory.role == 'builder') {
    	    builder.move(creep)
		}
		
        if(creep.memory.role == 'guard') {
        	var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        	if(targets.length) {
        		if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
        			creep.moveTo(targets[0]);		
        		}
        	}
        }
    }
}