function whoami() {
    const mySpawn = _.find(Game.spawns, s => s.my);
    if (mySpawn)
        return mySpawn.owner.username;

    const myStruct = _.find(Game.structures, s => s.my);
    if (myStruct)
        return myStruct.owner.username;

    const myCreep = _.find(Game.creeps, c => c.my);
    if (myCreep)
        return myCreep.owner.username;

    throw new Error(`Cannot determine username due to absense of structs and creeps`);
}

module.exports = {
    me: whoami(),
}