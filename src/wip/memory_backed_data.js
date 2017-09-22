'use strict';

class MemoryBackedData {
    constructor(path, defaultValue = {}) {
        this.path = path;
        if(!_.has(Memory, path))
            _.set(Memory, path, defaultValue);
        this.data = _.get(Memory, path);
        assert.Defined(this.data);
    }

    update(updater) {
        try {
            return updater(this.data);
        } finally {
            _.set(Memory, this.path, this.data);
        }
    }
}

class MemoryBackedHash extends MemoryBackedData {
    constructor(path) {
        super(path);
    }

    newId() {
        const maxAttempts = 10000;
        let randomId;
        for(let i=0; i<maxAttempts; ++i) {
            randomId = Math.floor(Math.random() * (1 << 32));
            const key = randomId.toString(16);
            if(!(key in this.data))
                return key;
        }
        throw new Error(`Cannot generate new Id. Tried ${maxAttempts} times`);
    }

    get(id) {
        if(!_.has(this.data, id))
            throw new Error(`Id [${id}] does not exist`);
        return this.unwrap(this.data[id]);
    }

    remove(id) {
        super.update(data => delete data[id]);
    }

    add(data) {
        assert.True(_.isObject(data));
        const id = this.newId();
        const wrapped = this.wrap(data);
        super.update(data => data[id]=wrapped);
        return id;
    }

    wrap(data) {
        return {data:data};
    }

    unwrap(record) {
        return record.data;
    }

}

class MemoryBackedTimeStampedHash extends MemoryBackedHash {
    constructor(path) {
        super(path);
    }

    wrap(data) {
        const wrapped = super.wrap(data);
        wrapped._created = Game.time;
        wrapped._lastUsed = Game.time;
        return wrapped
    }

    unwrap(record) {
        record._lastUsed = Game.time;
        return super.unwrap(record);
    }

    cleanup(deprecationTime=1000, respawnTime=0) {
        const keys = _.keys(this.data)

        function isDeprecated(key) {
            const item = this.data[key]
            if(deprecationTime > 0 && item._lastUsed < (Game.time - deprecationTime))
                return true
            if(respawnTime > 0 && item._created < respawnTime)
                return true
            return false
        }

        const deprecated = _.filter(keys, isDeprecated)
        this.update(data => _.each(deprecated, key => delete data[key]))
    }
}

class RequestDB extends MemoryBackedTimeStampedHash {
    constructor() {
        super('requests');
    }

    get(id) {
        const request = super.get(id);
        request._lastUsed = Game.time;
        return request.data;
    }

    add(requestData) {
        const request = new Request({data:requestData, id:null});
        const id = super.add(request);
        request.id = id;
        return id;
    }
}
