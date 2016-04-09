function isFull(creep)
{
    return _.sum(creep.carry) >= creep.carryCapacity;
}

function isStorageFull(storage)
{
    return storage.energy >= storage.energyCapacity;
}

module.exports.move = function(creep, source, storage)
{
    if(isFull(creep))
    {
        var ret = creep.harvest(source);
        if (ret == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source);
        }
    }
    else
    {
        if(isStorageFull(storage))
        {
            var controller = creep.room.controller;
            var ret = creep.upgradeController(controller);
            if (ret == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller);
            }
        }
        else
        {
            var ret = creep.transfer(storage, RESOURCE_ENERGY);
            if (ret == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(storage);
            }
        }
    }
}
