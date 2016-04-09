module.exports.move = function(creep, source, storage)
{
    if(_.sum(creep.carry) < creep.carryCapacity)
    {
        var ret = creep.harvest(source);
        if (ret == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source);
        }
    }
    else
    {
        var ret = creep.transfer(storage, RESOURCE_ENERGY);
        if (ret == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source);
        }
        else if(ret == ERR_FULL)
        {
            console.log('HAHA I KEEP IT TO MYSELF!');
        }
    }
}
