Source.prototype.getWorkRequired 	= function() {return Math.ceil(this.energyCapacity/600)}
Source.prototype.getInfo 			= function() {return Memory.sources[this.id]}
Source.prototype.getContainer 		= function() {return Game.getObjectById(this.getInfo().containerId)}
Source.prototype.getSite			= function() {return Game.getObjectById(this.getInfo().siteId)}
Source.prototype.getStorage			= function() {return Game.getObjectById(this.getInfo().storageId)}
