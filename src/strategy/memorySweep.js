exports.run = function()
{
    for(c in Memory.creeps)
    {
        if(Game.creeps[c] == undefined)
        {
            console.log('Cleaning [' + c + ']\'s memory')
            delete Memory.creeps[c]
        }
    }
}
