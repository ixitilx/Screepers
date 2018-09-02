'use strict';

const indentStr = '  ';

class Record {
    constructor(id) {
        this.id = id;
        this.start = Game.cpu.getUsed();
    };

    endRecord() {
        this.end = Game.cpu.getUsed();
    };

    addRecord(record) {
        if (!('children' in this))
            this.children = [];
        record.parent = this;
        this.children.push(record);
        return record;
    };

    format(recurse=true, indent=0) {
        const out = [];
        out.push(`${indentStr.repeat(indent)}${this.id} - ${this.start} - ${this.end}`);
        if (recurse && this.children) {
            const childrenRecs = _.map(this.children, c => c.format(recurse, indent+1));
            out.concat(childrenRecs);
        }
        return out;
    };

    print(recurse=true, indent=0) {
        const table = this.format(recurse, indent);

        _.each(table, console.log);

        // const rows = _.map(table, row => _.map(row, v => v.length));
        // const cols = _.zip(...rows);
        // const lengths = _.map(cols, _.max);

        // const formatRow = function(row) {
        //     const rowLen = _.zip(row, lengths);
        //     return _.map(rowLen, (value, len) => _.padRight(value, len));
        // };

        // _.each(_.map(table, formatRow), console.log);
    };
};

let root = new Record('root');
let curr = root;

function beginRecord(id) {
    const r = new Record(id);
    curr = curr.addRecord(r);
};

function endRecord() {
    curr.endRecord();
    curr = curr.parent;
};

function measure(id, functor) {
    beginRecord(id);
    try {
        return functor();
    } finally {
        endRecord();
    }    
};

function printReport() {
    root.print();
    root = new Record('root');
};

module.exports = {
    measure: measure,
    printReport: printReport,
};
