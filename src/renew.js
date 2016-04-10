var nearbyCreeps = new Array();


function findOldCreep(spawn)
{
    nearbyCreeps = spawn.room.findInRange(FIND_MY_CREEPS, 1);

    if (nearbyCreeps[0])
        var findOldCreepRet = nearbyCreeps[0];
    for (i=0; i < nearbyCreeps.length; i++)
    {
        if nearbyCreeps[i].ticksToLive < findOldCreepRet.ticksToLive
            findOldCreepRet = nearbyCreeps[i]
    }
    return findOldCreepRet
}

function renew(spawn, creep)
{
    if creep.ticksToLive <= floor(500/creep.body.length)
    {
        console.log(creep.name + 'was renewed.')
        return spawn.renewCreep(creep);
    }
    else return DONE;
}

exports.findOldCreep = findOldCreep;
exports.renew = renew;