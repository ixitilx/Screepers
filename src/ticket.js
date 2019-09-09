const prototypeUtils = require('utils.prototype');
const assert = prototypeUtils.assert;

const handlers = {};

function registerHandler(ticketType, handler) {
    assert(typeof ticketType === 'string');
    assert(typeof handler === 'function');

    if (_.has(handlers, ticketType))
        throw new Error(`Handler for tickets of type [${ticketType}] already exists`);

    handlers[ticketType] = handler;
};

function createTicket(ticketData) {
    const ticketCount = Game.ticketCount || 0;
    Game.ticketCount = ticketCount + 1;
    
    const ticketId = `${Game.time}_${ticketCount}`;

    ticketData._id = ticketId;
    ticketData._created = Game.time;
    ticketData._updated = Game.time;

    if (!Memory.tickets)
        Memory.tickets = {}

    _.set(Memory, ['tickets', ticketId], ticketData);
    console.log(`Created ticket [type:${type}, id:${ticketId}]`);
    return ticketId;
};

function handleTicket(ticketId) {
    const data = _.get(Memory, ['tickets', ticketId]);
    assert(!_.isUndefined(data), `Cannot find data for ticket [id:${ticketId}]`);
    assert(_.has(handlers, type), `No handlers for ticket type [${type}] registered`);

    const handler = _.get(handlers, data.type);
    handler(data);
};

module.exports = {
    createTicket: createTicket,
    registerHandler: registerHandler,
};
