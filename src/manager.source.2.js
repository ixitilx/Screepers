/**
    Entities:
        Container
        Link
        Harvesters

    Do I have a link?
**/

const builderService = {
    build : function() {
        return undefined;
    }
};

const tickets = {};
let lastTicketId = 0;

const ticketService = {
    createTicket : function(details) {
        tickets[lastTicketId] = details;
        return lastTicketId++;
    },

    getTicket : function(id) {
        return tickets[id];
    },
}

function getLink() {
    if (source.linkId) {
        const link = Game.getObjectById(source.linkId);
        if (link)
            return link;
        console.log(`Link ${source.linkId} for source ${source.id} has disappeared`);
        delete source.linkId;
    }

    if (source.linkTicketId) {
        const linkTicket = ticketService.getTicketById(source.linkTicketId);

        if (linkTicket.isDone()) {
            source.linkId = linkTicket.getResult();
            const link = getLink();
        } else {
            return ERR_IN_PROGRESS;
        }
    }
};

function getCountainer() {

};

function getHarvesters() {

};

function harvest(source) {
    const harvesters = getHarvesters(source);
};

function getWorkCount() {

};

function orderNewHarvester(source) {
    if (hasContainer(source) && !hasLink(source)) {
        orderCreep()
    }
};

function orderHarvesters(source) {
    const workNeededMax = (source.energyCapacity / ENERGY_REGEN_TIME) / HARVEST_POWER;
    const spots = source.spots;

    if (hasLink || hasContainer) {
        body = 'mcw(mww)*';
    } else {
        body = 'mc(mw)*';
    }

    const harvesters = getHarvesters(source);
    const currentUnits = getHarvesterCount(source);
    const currentWork = getWork
    // console.log(`Maximum work which can be handled by ${source.id} is ${workNeededMax}. And there are ${_.size(spots)} spots`);
};

function orderContainer(source) {

};

function manage(source) {
    source.drawSpots();

    harvest(source);
    orderHarvesters(source);
    orderContainer(source);


    // const workNeeded = _(harvesters).map(getWorkCount).sum();

    // const container = getContainer(source);
    // if (container)
    // _(harvesters).filter(isFull).dropEnergy(container);


    // if (hasLink(source)) {
    //     if (!source.linkTicketId)
    //         source.linkTicketId = builderService.build(STRUCTURE_LINK, source.containerSpot);
        
    //     if (source.linkTicketId) {
    //         const ticket = ticketService.getTicket(source.linkTicketId);

    //     }
    // }
};

module.exports = manage;
