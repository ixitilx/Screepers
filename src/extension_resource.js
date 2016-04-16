require('extension_all').extend('Resource', Resource.prototype)

Resource.prototype.transfer = function(target, resourceType)
{
    if(resourceType == this.resourceType)
        return target.pickup(this)
}

Resource.prototype.transferEnergy = function(target)
{
    return target.pickup(this)
}
