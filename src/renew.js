var nearbyCreeps = new Array();


function findOldCreep(storage)
{
    nearbyCreeps = storage.pos.findInRange(FIND_MY_CREEPS, 1);
    if (nearbyCreeps.length == 0)
        return undefined;

    nearbyCreeps.sort(function(a,b){
        return a.ticksToLive - b.ticksToLive;
    });

    return nearbyCreeps[0];
}

function renewCreep(storage, creep)
{
    if (creep.ticksToLive <= (1500 - (500/creep.body.length)))
    {
        console.log(creep.name + 'was renewed.')
        return storage.renewCreep(creep);
    }
    else return DONE;
}

exports.findOldCreep = findOldCreep;
exports.renewCreep = renewCreep;