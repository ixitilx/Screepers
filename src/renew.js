var nearbyCreeps = new Array();


function findOldCreep(storage)
{
    nearbyCreeps = storage.pos.findInRange(FIND_MY_CREEPS, 1);

    if (nearbyCreeps[0])
        var findOldCreepRet = nearbyCreeps[0];
    for (i=0; i < nearbyCreeps.length; i++)
    {
        if (nearbyCreeps[i].ticksToLive < findOldCreepRet.ticksToLive)
            findOldCreepRet = nearbyCreeps[i]
    }
    return findOldCreepRet
}

function renewCreep(storage, creep)
{
    if (creep.ticksToLive <= floor(500/creep.body.length))
    {
        console.log(creep.name + 'was renewed.')
        return storage.renewCreep(creep);
    }
    else return DONE;
}

exports.findOldCreep = findOldCreep;
exports.renewCreep = renewCreep;