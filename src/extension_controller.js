require('extension_all').extend('Controller', Controller.prototype)

Controller.prototype.getExtensionCapacity = function()
{
	switch(this.level)
	{
		case 7: return 100
		case 8: return 200
		default: return 50
	}
}
