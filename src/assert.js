'use strict';

module.exports = function(criteria, message='Assertion error') {
    if(!criteria) {
        throw new Error(message);
    }
};
