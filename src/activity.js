'use strict'

const logger = require('logger')
const Screeps = require('screeps')


function runActivity(object, activityConstructor, ...args)
{
    const activity = new activityConstructor(object, ...args)
    activity.run()
}

//
// Never-ending operation
// Example: Resource mining / Controller upgrade
//

//
// Why activities?
// - can wrap logger in
//

class BaseActivity {
    constructor(object) {
        Screeps.assert(!_.isUndefined(object))
        this.object = object
        this.memory = {}
    }

    getObject() {
        return this.object
    }

    run() {
        this.object.lastActivity = this.getConstructorName()
        return OK
    }

    dump() {

    }
}

class RoomActivity extends BaseActivity {
    constructor(room) {
        Screeps.assertType(room, Room)
        super(room)
    }

    run() {
        return super.run()
    }

    get room() {
        return super.getObject()
    }
}

class RoomActivityHarvestResources extends RoomActivity {
    constructor(room) {
        super(room)
    }

    run() {
        const superRet = super.run()
        if(superRet !== OK)
            return superRet

        _.each(this.room.sources, source => runActivity(source, Activities.SourceActivityHarvest))
        // _.each(this.room.minerals, mineral => mineral.runActivity(Activities.MineralActivityHarvest))

        return OK
    }
}

class SourceActivity extends BaseActivity {
    constructor(source) {
        Screeps.assertType(source, Source)
        super(source)
    }

    get source() {
        return super.getObject()
    }
}

class SourceActivityHarvest extends SourceActivity {
    constructor(source) {
        super(source)
    }

    run() {
        const harv = this.source.harvesters
        Screeps.assertType(harv, Array)

        let count = _.size(harv)
        let work = _(harv).map(c => c.partCount[WORK]).sum()

        while(count < _.size(this.source.spots) &&
              work < this.source.workNeeded)
        {
            const ret = this.source.room.requestCreep(Roles.Harvester, this.source)
            if(!ret instanceof Creep)
                break
            harv.push(ret)
            count += 1
            work += harv.partCount[WORK]
        }

        _.each(harv, creep => creep.runActivity(Activities.CreepActivityHarvest, this.source))
    }
}
//
// How to find out what creep harvests?
// Creep.memory.activities[CreepActivityHarvest].sourceId?
//
class CreepActivity extends BaseActivity {
    constructor(creep) {
        Screeps.assertType(creep, Creep)
        Screeps.assert(creep.partCount[WORK]>0 && creep.partCount[MOVE]>0)
        super(creep)
    }

    get creep() {
        return super.getObject()
    }
}

class CreepActivityHarvest extends CreepActivity {
    constructor(creep, source) {
        super(creep)
        this.source = source
    }

    run() {
        if(!this.creep.pos.isNearTo(this.source))
            return harvester.checkedMoveTo(this.source)
        return harvester.harvest(this.source)
    }
}

const Activities = {
    BaseActivity : BaseActivity,

    RoomActivity : RoomActivity,
    RoomActivityHarvestResources : RoomActivityHarvestResources,

    SourceActivity : SourceActivity,
    SourceActivityHarvest : SourceActivityHarvest,

    CreepActivity : CreepActivity,
    CreepActivityHarvest : CreepActivityHarvest
}

exports.Activities = Activities
exports.runActivity = runActivity
//
// Rooms
//      base     (claimed controller)
//      remote   (reserved controller)
//      neutral  (nothing here)
//
// RoomOwner
//      my
//      ally
//      neutral
//      enemy
//
