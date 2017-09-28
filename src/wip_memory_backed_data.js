'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MemoryBackedData = (function () {
    function MemoryBackedData(path, defaultValue) {
        if (defaultValue === void 0) { defaultValue = {}; }
        this.path = path;
        if (!_.has(Memory, path))
            _.set(Memory, path, defaultValue);
        this.data = _.get(Memory, path);
        assert.Defined(this.data);
    }
    MemoryBackedData.prototype.update = function (updater) {
        try {
            return updater(this.data);
        }
        finally {
            _.set(Memory, this.path, this.data);
        }
    };
    return MemoryBackedData;
}());
var MemoryBackedHash = (function (_super) {
    __extends(MemoryBackedHash, _super);
    function MemoryBackedHash(path) {
        return _super.call(this, path) || this;
    }
    MemoryBackedHash.prototype.newId = function () {
        var maxAttempts = 10000;
        var randomId;
        for (var i = 0; i < maxAttempts; ++i) {
            randomId = Math.floor(Math.random() * (1 << 32));
            var key = randomId.toString(16);
            if (!(key in this.data))
                return key;
        }
        throw new Error("Cannot generate new Id. Tried " + maxAttempts + " times");
    };
    MemoryBackedHash.prototype.get = function (id) {
        if (!_.has(this.data, id))
            throw new Error("Id [" + id + "] does not exist");
        return this.unwrap(this.data[id]);
    };
    MemoryBackedHash.prototype.remove = function (id) {
        _super.prototype.update.call(this, function (data) { return delete data[id]; });
    };
    MemoryBackedHash.prototype.add = function (data) {
        assert.True(_.isObject(data));
        var id = this.newId();
        var wrapped = this.wrap(data);
        _super.prototype.update.call(this, function (data) { return data[id] = wrapped; });
        return id;
    };
    MemoryBackedHash.prototype.wrap = function (data) {
        return { data: data };
    };
    MemoryBackedHash.prototype.unwrap = function (record) {
        return record.data;
    };
    return MemoryBackedHash;
}(MemoryBackedData));
var MemoryBackedTimeStampedHash = (function (_super) {
    __extends(MemoryBackedTimeStampedHash, _super);
    function MemoryBackedTimeStampedHash(path) {
        return _super.call(this, path) || this;
    }
    MemoryBackedTimeStampedHash.prototype.wrap = function (data) {
        var wrapped = _super.prototype.wrap.call(this, data);
        wrapped._created = Game.time;
        wrapped._lastUsed = Game.time;
        return wrapped;
    };
    MemoryBackedTimeStampedHash.prototype.unwrap = function (record) {
        record._lastUsed = Game.time;
        return _super.prototype.unwrap.call(this, record);
    };
    MemoryBackedTimeStampedHash.prototype.cleanup = function (deprecationTime, respawnTime) {
        if (deprecationTime === void 0) { deprecationTime = 1000; }
        if (respawnTime === void 0) { respawnTime = 0; }
        var keys = _.keys(this.data);
        function isDeprecated(key) {
            var item = this.data[key];
            if (deprecationTime > 0 && item._lastUsed < (Game.time - deprecationTime))
                return true;
            if (respawnTime > 0 && item._created < respawnTime)
                return true;
            return false;
        }
        var deprecated = _.filter(keys, isDeprecated);
        this.update(function (data) { return _.each(deprecated, function (key) { return delete data[key]; }); });
    };
    return MemoryBackedTimeStampedHash;
}(MemoryBackedHash));
var RequestDB = (function (_super) {
    __extends(RequestDB, _super);
    function RequestDB() {
        return _super.call(this, 'requests') || this;
    }
    RequestDB.prototype.get = function (id) {
        var request = _super.prototype.get.call(this, id);
        request._lastUsed = Game.time;
        return request.data;
    };
    RequestDB.prototype.add = function (requestData) {
        var request = new Request({ data: requestData, id: null });
        var id = _super.prototype.add.call(this, request);
        request.id = id;
        return id;
    };
    return RequestDB;
}(MemoryBackedTimeStampedHash));
//# sourceMappingURL=memory_backed_data.js.map