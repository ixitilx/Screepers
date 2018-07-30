const k_memoryPropCallbacks = [];

function makeCachedPropertyDescriptor(computeFunc) {
    let cache;

    return {
        get: function() {
            if (_.isUndefined(cache))
                cache = computeFunc.call(this);
            return cache;
        },

        set: function(value) {
            return cache = value;
        }
    };
}

function makeTickCachedPropertyDescriptor(computeFunc) {
    let cache;
    let time = Game.time;

    return {
        get: function() {
            if (_.isUndefined(cache) || time !== Game.time) {
                cache = computeFunc.call(this);
                time = Game.time;
            }
            return cache;
        },

        set: function(value) {
            return cache = value;
        }
    };
}

function makeMemoryBackedPropertyDescriptor(name, computeFunc, loadFunc, saveFunc) {
    let cache;
    let onTickEndRegistered = false;

    const registerOnTickEnd = function(gameObject) {
        const callback = function() {
            const m = saveFunc.call(gameObject, cache);
            _.set(gameObject.memory, name, m);
        };

        onTickEndRegistered = true;
        k_memoryPropCallbacks.push(callback);
    };

    return {
        get: function() {
            if (_.isUndefined(cache)) {
                if (!_.has(this.memory, name)) {
                    cache = computeFunc.call(this);
                } else {
                    const m = _.get(this.memory, name);
                    cache = loadFunc.call(this, m);
                }

                if (!onTickEndRegistered && !_.isUndefined(cache))
                    registerOnTickEnd(this);
            }
            return cache;
        },

        set: function(value) {
            if(!onTickEndRegistered && !_.isUndefined(cache))
                registerOnTickEnd(this);

            return cache = value;
        }
    };
}

function onTickEnd() {
    _.each(k_memoryPropCallbacks, callback => callback());
}
