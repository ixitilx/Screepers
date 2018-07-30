function analyze(source) {
    analyze_findHarvesterPositions(source)
    analyze_findContainerPosition(source)
    analyze_releaseUselessHarvesters(source)
    analyze_requestHarvesters(source)
    analyze_requestContainer(source)
    analyze_requestRoad(source)
}

function analyze_findHarvesterPositions(source) {
    var pos = source.pos;

    var terra = source.room.lookForAtArea(
                    LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true)

    var spots = _(terra).filter(t => t.terrain != 'wall')
                        .map(t => ({'x': t.x, 'y': t.y}))
                        .value()
    var color = '#FF0000'
    var t = Game.time % 10
    if(t <= 3) color = '#FF0000'
    else if(t <= 6) color = '#00FF00'
    else color = '#0000FF'
    _.each(spots, s => source.room.visual.circle(s.x, s.y, {fill:color}))

    return spots
}

function analyze_findContainerPosition(source) {

}

function analyze_releaseUselessHarvesters(source) {

}

function analyze_requestHarvesters(source) {

}

function analyze_requestContainer(source) {

}

function analyze_requestRoad(source) {

}

function operate(source) {

}

exports.analyze = analyze
exports.operate = operate
