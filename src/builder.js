function build(creep) {
    var sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if(sites.length == 0)
        return false;
    if(creep.build(sites[0]) == ERR_NOT_IN_RANGE)
        creep.moveTo(sites[0])
    return true;
}

function recharge(creep) {
	if(creep.carry.energy >= creep.carryCapacity)
	    return false;
    if(Game.spawns.Spawn1.transferEnergy(creep) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep);
    return true;
}

function repair(creep)
{
    var units = creep.room.find(FIND_MY_STRUCTURES, { filter: x => x.hits < x.hitsMax });
    units.sort((a,b) => a.hits - b.hits);
    if(units.length > 0) {
        var unit = units[0]
        var ret = creep.repair(units[0])
        console.log('Repairing [' + unit + ']: ' + unit.hits + '/' + unit.hitsMax + ' => ' + ret)
        if( ret == ERR_NOT_IN_RANGE) {
            creep.moveTo(unit);
        }
    }
    return false;
}

function harvest(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
		var sources = creep.room.find(FIND_SOURCES);
		if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(sources[0]);
		}			
	}
	else {
		if(creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(Game.spawns.Spawn1);
		}
	}
}

function upgrade(creep)
{
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.room.controller);
    return true;
}

module.exports.move = function (creep) {
    return recharge(creep)
           || build(creep)
           || repair(creep)
           || harvest(creep)
           || upgrade(creep);
}
