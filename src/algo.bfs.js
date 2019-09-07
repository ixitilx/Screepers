'use strict';

const _nearIdx = [-51, -50, -49, -1, 1, 49, 50, 51];

function floodFillIdxStep(idx, visited, filter) {
    const wave = [];
    _nearIdx.forEach(di => {
        const newIdx = idx + di;
        if (!visited.has(newIdx) && filter(newIdx)) {
            visited.add(newIdx);
            wave.push(newIdx);
        }
    });
    return wave;
};

function floodFillStep(wave, visited, filter) {
    return _(wave).map(idx => floodFillIdxStep(idx, visited, filter))
                  .flatten()
                  .value();
};

function bfsWave(wave, visitedNodes, config) {

};

function visit(node, pathLen)
{

};

function bfs(startNodes, config) {
    const visitedNodes = {};

    function visit(node, fromNode, waveIdx) {
        if (!(node in visitedNodes)) {
            const parentNodes = _.isNull(fromNode) ? [] : [fromNode];
            visitedNodes[node] = {waveIdx: waveIdx, parents: parentNodes};
            return true;
        }

        if (visitedNodes[node].waveIdx === waveIdx)
            visitedNodes[node].parents.push(fromNode);

        return false;
    };

    _.each(startNodes, node => visit(node, null, 0));

    let wave = startNodes;
    for (let idx = 0; wave.length; ++idx) {
        wave = bfsWave(wave, visitedNodes, config);
        if (config && config.waveCallback && config.waveCallback(wave, idx)===false)
            break;
    }
    return Array.from(visited);
};
