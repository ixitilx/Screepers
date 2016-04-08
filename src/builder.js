function findSpawn(creep) {
    var roomSpawns = creep.room.find(FIND_MY_SPAWNS);
    if(roomSpawns.length)
        return roomSpawns[0]
    console.log('Can not find spawn for creep ' + creep)
    return undefined;
}

function isEnergyAvailable(creep, spawn) {
    var needEnergy = creep.carryCapacity - creep.carry;
    return needEnergy==0 ||
           spawn != undefined && spawn.energy >= needEnergy;
}

function recharge(creep, spawn) {
    if(!isEnergyAvailable(creep, spawn))
        return false;
    if(spawn.transferEnergy(creep)==ERR_NOT_IN_RANGE)
        creep.moveTo(spawn);
    return true;
}

function build(creep, site) {
    if()
    if(creep.build(site) == ERR_NOT_IN_RANGE)
        creep.moveTo(site)
    return true;
}

function repair(creep)
{
    var structures = creep.room.find(FIND_MY_STRUCTURES, { filter: x => x.hits < x.hitsMax });
    structures.sort((a,b) => a.hits - b.hits);
    if(structures.length == 0)
        return false;

    var structure = structures[0]
    var ret = creep.repair(structures[0])
    console.log('Repairing [' + structure + ']: ' + structure.hits + '/' + structure.hitsMax + ' => ' + ret)
    if( ret == ERR_NOT_IN_RANGE) {
        creep.moveTo(unit);

    return true;
}

function harvest(creep) {
    if(creep == undefined)
        return false;

    var spawn = findSpawn(creep)
    if(spawn == undefined)
        return false;

    var sourceId = creep.memory.sourceId;
    if(sourceId == undefined)
        return false;

    var source = creep.getObjectById(sourceId)
    if(source == undefined)
        return false;

    return harvest(creep, spawn, source)
}

function harvest(creep, spawn, source)
{
    if( creep == undefined ||
        spawn == undefined ||
        source == undefined )
        return -1;

    if(creep.carry.energy < creep.carryCapacity)
    {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE)
            creep.moveTo(source);
    }
    else
    {
        if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            creep.moveTo(spawn);
    }
}

function upgrade(creep)
{
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
        creep.moveTo(creep.room.controller);
    return true;
}

module.exports.move = function (creep) 
{
    return recharge(creep)
           || build(creep)
           || repair(creep)
           || harvest(creep)
           || upgrade(creep);
}
