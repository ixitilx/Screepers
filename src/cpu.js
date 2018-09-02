'use strict';

const indentStr = '  ';

function fmtFloat(x) {
    return Number.parseFloat(x).toFixed(4);
};

class Record {
    constructor(id) {
        this.id = id;
        this.start = Game.cpu.getUsed();
        this.children = [];
    };

    endRecord() {
        this.end = Game.cpu.getUsed();
    };

    addRecord(record) {
        record.parent = this;
        this.children.push(record);
        console.log(`${this.id}, ${this.children.length}`);
        return record;
    };

    format(out, recurse=true, indent=0) {
        const ind = indentStr.repeat(indent);
        const sta = fmtFloat(this.start);
        const end = fmtFloat(this.end);
        out.push(`${ind}${this.id} ${sta} ${end} ${this.children.length}`);
        if (recurse)
            _.each(this.children, c => c.format(out, recurse, indent+1));
        return out;
    };

    print(recurse=true, indent=0) {
        const out = [];
        this.format(out, recurse, indent);
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

let root;
let curr;

function beginRecord(id) {
    curr = curr.addRecord(new Record(id));
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

function reset() {
    root = new Record('root');
    curr = root;
};

function printReport() {
    root.endRecord();
    root.print();
};

module.exports = {
    reset: reset,
    measure: measure,
    printReport: printReport,
};
