'use strict';

const logger = require('logger')

Array.prototype.count = function(value)
{
	let count = 0
	for(let i=0; i<this.length; i++)
		if(this[i]==value)
			count++
	return count
}