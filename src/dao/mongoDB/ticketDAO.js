import Ticket from '../models/ticket.model.js'

class TicketDAO {
    async createTicket(ticket) {
        return await ticket.save();
    }
}

export default new TicketDAO()