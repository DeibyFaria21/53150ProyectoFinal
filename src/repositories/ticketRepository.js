import ticketDAO from '../dao/mongoDB/ticketDAO.js'

class ticketRepository {
    async createTicket(ticket) {
        return await ticketDAO.createTicket(ticket)
    }
}

export default new ticketRepository()