'use strict';

const logger = require('logger')
const Screeps = require('screeps')
const Empire = require('empire')

const roles = new Object()

const ROLE_HARVESTER = 'Harvester'

function getRoleLoader(role)
{
    return function()
    {
        logger.debug('Loading creep role', role)
        return require('creep_role_' + role.toLowerCase())
    }
}

function resolveGameObject(obj)
{
    while(typeof(obj)=='function')
        obj = obj.call(this)
    if(typeof(obj)=='string' && obj.match(/^[a-f0-9]{24}$/))
        obj = Empire.getObjectById(obj)
    if(obj===undefined || obj===null)
        throw new Error('Invalid argument: json: ' + JSON.stringify(obj))
    if(typeof(obj)!='object')
        throw new Error('Unexpected object type: ' + typeof(obj) + ', json: ' + JSON.stringify(obj))
    return obj
}


Creep.prototype.manage = function()
{
    const manager = roles.getDefault(this.memory.role, getRoleLoader(this.memory.role))
    return manager.run.call(this)
}

Creep.prototype.loadCargo = function(obj)
{
    obj = resolveGameObject(obj)

    if(obj instanceof Resource)
        return this.pickup(obj)
    else if(obj instanceof Structure)
        return this.withdraw(obj)
    else
        throw new Error('Unknown object type: ' + JSON.stringify(obj))
}

Creep.prototype.unloadCargo = function(obj)
{
    obj = resolveGameObject(obj)

    if(obj instanceof StructureController)
        return this.drop(RESOURCE_ENERGY)
    else if(obj instanceof Structure)
        return this.checkedTransfer(obj, RESOURCE_ENERGY)
    else
        throw new Error('Unknown object type: ' + JSON.stringify(obj))
}

function samePos(a, b)
{
    return a.x==b.x && a.y==b.y && a.roomName==b.roomName
}

function defaultCostCallback(roomName, costMatrix)
{
    const room = Game.rooms[roomName]
    if(!room)
        return

    if(room._defaultCostMatrix)
    {
        costMatrix = room._defaultCostMatrix
        return
    }

    function avoid(p) {costMatrix.set(p.x, p.y, 255)}

    const structs = _(room.structures)
        .filter(s => s.structureType!=STRUCTURE_ROAD && s.structureType!=STRUCTURE_CONTAINER)
        .map(s => s.pos)
        .value()
    
    const creeps = _(room.creeps)
        .filter(c => c.my && c.memory.role===ROLE_HARVESTER && !c.isMoving)
        .map(c => c.pos)
        .value()

    _([structs, creeps]).flatten().map(avoid).value()

    room._defaultCostMatrix = costMatrix
}

Creep.prototype.checkedTransfer = function(target, resourceType, amount=50*50)
{
    Screeps.assert(amount>=0)

    if(amount===0)
        return OK

    target = resolveGameObject(target)

    if(!(target instanceof Structure) && !(target instanceof Creep))
        throw new Error(this + ' can transfer to structures or creeps. Got ' + target + ' instead')

    const carry = this.carry[resourceType] 
    const space = target.unusedEnergyCapacity

    if(carry===0)
        return ERR_NOT_ENOUGH_RESOURCES
    if(space===0)
        return ERR_FULL

    amount = Math.min(carry, amount, space)

    logger.debug(this, 'transfering', amount, 'of [' +resourceType + '] to', target, 'carry:', carry, 'space:', space)

    const ret = this.transfer(target, resourceType, amount)

    if(ret===OK || ret===ERR_NOT_IN_RANGE || ret===ERR_FULL)
        return ret
    
    throw new Error(this + '.transfer(' + target + ', ' + resourceType + ', ' + amount + ') => ' + ret)
}

Creep.prototype.checkedMoveTo = function(target, range=0, costCallback=defaultCostCallback)
{
    target = Screeps.resolveRoomPosition(target)

    if(typeof(costCallback) != 'function')
        throw new Error('costCallback must be a function. Got ['+typeof(costCallback)+'] instead')

    if(this.memory.move===undefined || !Screeps.samePos(this.memory.move.target, target))
    {
        logger.debug(this, 'checkedMoveTo', 'new target:', target)
        this.memory.move = {target:target}
    }

    if(this.memory.move.path===undefined || !this.isMoving)
    {
        const config = {ignoreCreeps:true, serialize:true, costCallback:costCallback}
        let path = this.room.findPath(this.pos, target, config)
        if(config.serialize)
            path = range ? path.slice(0, -range) : path
        else
            path = _.take(path, _.size(path)-range)

        logger.debug(this, 'checkedMoveTo', 'new path:', path)
        this.memory.move.path = path
    }

    const ret = this.moveByPath(this.memory.move.path)
    logger.trace(this, 'moveByPath', ret)

    if([OK, ERR_BUSY, ERR_TIRED].includes(ret))
        return ERR_BUSY

    if(ret == ERR_NOT_FOUND)
    {
        logger.warning(this + '.moveByPath(' + this.memory.move.path + ') => ERR_NOT_FOUND, recalculating path')
        delete this.memory.move
        return ERR_BUSY
    }

    throw new Error(this + '.moveByPath(' + this.memory.move.path + ') => ' + ret)
}

function canHaul()
{
    return this.getActiveBodyparts(CARRY)>0 && this.getActiveBodyparts(MOVE)>0
}

function isMoving()
{
    const ret = this.memory.lastPos && !samePos(this.pos, this.memory.lastPos)
    // logger.trace(this, 'isMoving =', ret)
    return ret
}

function getFreeCapacity()
{
    return this.carryCapacity - _.sum(this.carry)
}

function getManager()
{
    const id = this.managerId
    const mgr = id && Empire.getObjectById(id)
    if(id && !mgr)
        this.managerId = undefined
    return mgr
}

function getPartCount()
{
    return _.countBy(this.body, 'type')
}

Screeps.newTickProperty(Creep, canHaul, 'canHaul')
Screeps.newTickProperty(Creep, isMoving, 'isMoving')
Screeps.newTickProperty(Creep, getFreeCapacity, 'freeCapacity')
Screeps.newTickProperty(Creep, getManager, 'manager')
Screeps.newTickProperty(Creep, getPartCount, 'partCount')
Screeps.newMemoryProperty(Creep, ()=>undefined, 'managerId')
