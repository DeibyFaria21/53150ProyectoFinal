import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        default: () => uuidv4().replace(/-/g, ''),
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    purchaser: {
        type: String,
        required: true,
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }]
}, { timestamps: true })

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket
