'use strict';

const assert = require('assert')

const BlockLayerModule = require('block_layer')
const BlockLayer = BlockLayerModule.BlockLayer

// 
// Task is to allow script to decide what to build and where
// Idea is to craft blocks by hand and place by script
//
const buildPriority = [
    // STRUCTURE_RAMPART,
    // STRUCTURE_WALL,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_SPAWN,
    // STRUCTURE_ROAD,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER
]

const rampartCoverage = [
    STRUCTURE_TOWER,
    STRUCTURE_STORAGE,
    STRUCTURE_SPAWN,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_TERMINAL,
    STRUCTURE_NUKER
]

const decode = {
    s: STRUCTURE_SPAWN,
    e: STRUCTURE_EXTENSION,
    r: STRUCTURE_ROAD,
    w: STRUCTURE_WALL,
    R: STRUCTURE_RAMPART,
    // STRUCTURE_KEEPER_LAIR: "keeperLair",
    // STRUCTURE_PORTAL: "portal",
    // STRUCTURE_CONTROLLER: "controller",
    l: STRUCTURE_LINK,
    S: STRUCTURE_STORAGE,
    t: STRUCTURE_TOWER,
    o: STRUCTURE_OBSERVER,
    // STRUCTURE_POWER_BANK: "powerBank",
    p: STRUCTURE_POWER_SPAWN,
    // STRUCTURE_EXTRACTOR: "extractor",
    L: STRUCTURE_LAB,
    T: STRUCTURE_TERMINAL,
    c: STRUCTURE_CONTAINER,
    n: STRUCTURE_NUKER
}

const blocks = [
    [' ee ',    // extension x8
     'e se',    // spawn-1, container
     'etce',    // tower
     ' ee '],

    [' ee ',    // extension x8
     'e le',    // link
     'eS e',    // storage
     ' ee '],
]

class Block
{
    constructor(layers)
    {
        assert.True(layers)
        this.layers = _.map(layers, layer => layer instanceof BlockLayer ? layer : new BlockLayer(layer))
        const w = this.layers[0].w
        const h = this.layers[0].h        
        assert.True(_.every(this.layers, layer => layer.w === w && layer.h === h))
        this.w = w
        this.h = h
    }

    rotateCw() { return new Block(_.map(this.layers, layer => layer.rotateCw())) }
    mirrorH () { return new Block(_.map(this.layers, layer => layer.mirrorH ())) }
    mirrorV () { return new Block(_.map(this.layers, layer => layer.mirrorV ())) }

    pick(x, y)
    {
        let s = ' '
        function update_s(layer) { s = layer.getAt(x, y); return s === ' '; }
        _.each(this.layers, update_s)
        return s

    }

    schedule(pos, opts={})
    {
        assert.instanceOf(pos, RoomPosition)
        const room = Game.rooms[pos.roomName]
        assert.instanceOf(room, Room)

        const byChar = {}
        for(let y=0; y<this.h; y++)
        {
            for(let x=0; x<this.w; x++)
            {
                const character = this.pick(x, y)
                if(character !== " ")
                {
                    assert.Defined(decode[character])
                    if(!(character in queue))
                        byChar[character] = []
                    byChar[character].push({x:x, y:y})
                }
            }
        }

        const queue = []
        _(buildPriority).map(c => _.toArray(byChar[c]))

        console.log()
    }
}

class Layout
{
    constructor(layoutDefinition)
    {
        this.def = layoutDefinition
    }
}

