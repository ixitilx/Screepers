'use strict';

const assert = require('assert')

class BlockLayer
{
    constructor(layerDefinition)
    {
        if(layerDefinition instanceof BlockLayer)
        {
            this.def = layerDefinition.def
            this.w = layerDefinition.w
            this.h = layerDefinition.h
        }
        else
        {
            [this.w, this.h] = BlockLayer.validateLayerDefinition(layerDefinition)
            this.def = layerDefinition
        }
    }

    static validateLayerDefinition(layerDefinition)
    {
        const h = _.size(layerDefinition)
        assert.True(h>0)
        const w = _.size(layerDefinition[0])
        const rectangular = _.every(layerDefinition, row => _.size(row)===w)
        assert.True(rectangular)
        return [w, h]
    }

    rotateCw()
    {
        const rcopy = this.def.slice().reverse()
        const arrays = _.map(rcopy, row => _.toArray(row))
        const zipped = _.zip(...arrays)
        const rotated = _.map(zipped, col => _(col).join(''))
        return new BlockLayer(rotated)
    }

    rotateCcw()
    {
        const arrays = _.map(this.def, row => _.toArray(row))
        const zipped = _.zip(...arrays)
        const rotated = _.map(zipped, col => _(col).join(''))
        return new BlockLayer(rotated.reverse())
    }

    mirrorH()
    {
        return new BlockLayer(_.map(this.def, line => _.toArray(line).reverse().join('')))
    }

    mirrorV()
    {
        return new BlockLayer(this.def.slice().reverse())
    }

    getAt(x, y)
    {
        assert.True(0 <= x && x <= this.w)
        assert.True(0 <= y && y <= this.h)
        return this.def[y][x]
    }

    print()
    {
        _.each(this.def, line => console.log(line))
    }

    static equals(a, b)
    {
        return a.w === b.w && a.h === b.h &&
               _.every(_.zip(a.def, b.def), ([linea, lineb]) => linea === lineb)
    }
}

function BlockLayerUnitTest()
{
    const testData = {
        base:   ["abcd","efgh","ijkl","mnop"],
        cw:     ["miea","njfb","okgc","plhd"],
        ccw:    ["dhlp","cgko","bfjn","aeim"],
        mh:     ["dcba","hgfe","lkji","ponm"],
        mv:     ["mnop","ijkl","efgh","abcd"]
    }

    const bl = new BlockLayer(testData.base)
    assert.True(BlockLayer.equals(new BlockLayer(testData.cw),  bl.rotateCw ()))
    assert.True(BlockLayer.equals(new BlockLayer(testData.ccw), bl.rotateCcw()))
    assert.True(BlockLayer.equals(new BlockLayer(testData.mh),  bl.mirrorH  ()))
    assert.True(BlockLayer.equals(new BlockLayer(testData.mv),  bl.mirrorV  ()))
    assert.Equal(bl.getAt(0, 1), "e")
    assert.Equal(bl.getAt(2, 0), "c")
}

BlockLayerUnitTest()

exports.BlockLayer = BlockLayer
