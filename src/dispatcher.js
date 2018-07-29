'use strict';

const event = require('event');

exports.subscribe = subscribe;
exports.queueEvent = queueEvent;
exports.eventQueueSink = eventQueueSink;
exports.processEvent = processEvent;
exports.processEventQueue = processEventQueue;

const eventQueue = [];
const eventHandlers = {};

function subscribe(eventId, handler) {
    if(! (eventId in eventHandlers))
        eventHandlers[eventId] = [];
    eventHandlers[eventId].push(handler);
}

function queueEvent(eventId, ...eventData) {
    eventQueue.push({
        eventId: eventId,
        eventData: eventData,
    });
}

function eventQueueSink(eventId) {
    return function(...eventData) {
        return queueEvent(eventId, ...eventData);
    }
}

function runHandler(handler, ...eventData) {
    try {
        return handler(...eventData);
    } catch(error) {
        console.log(error.stack);
    }
}

function processEvent(eventId, ...eventData) {
    _.each(eventHandlers[eventId], handler => runHandler(handler, ...eventData));
}

function processEventQueue() {
    while(_.size(eventQueue) > 0) {
        const {eventId, eventData} = eventQueue.shift();
        processEvent(eventId, ...eventData);
    }
}
