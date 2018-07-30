function analyze(source) {
    analyze_findHarvesterPositions(source);
    analyze_findContainerPosition(source);
    analyze_releaseUselessHarvesters(source);
    analyze_requestHarvesters(source);
    analyze_requestContainer(source);
    analyze_requestRoad(source);
}

function analyze_findHarvesterPositions(source) {
    findHarvesterPositions(source);
}

function getHarvesterPositions(source) {
    var cache = getCache(source.id);
    var prop = 'harvesterPositions';
    if (!_.has(cache, prop)) {
        if (!_.has(source.memory, prop))
            cache[prop] = findHarvesterPositions(source);
        else
            cache[prop] = loadHarvesterPositions(source.memory[prop]);
    }
    return cache[prop];
 }

function findHarvesterPositions(source) {
    var pos = source.pos;
    var terra = source.room.lookForAtArea(
                    LOOK_TERRAIN, pos.y-1, pos.x-1, pos.y+1, pos.x+1, true);
    return _(terra).filter(t => t.terrain !== 'wall')
                   .map(t => new RoomPosition(t.x, t.y, source.room.name))
                   .value();
}

function loadHarvesterPositions(json) {
    return _(json).map(p => new RoomPosition(p[0], p[1], source.room.name)).value();
}

function saveHarvesterPositions(list) {
    return _(list).map(p => [p.x, p.y]).value();
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

exports.analyze = analyze;
exports.operate = operate;
