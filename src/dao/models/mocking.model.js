import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const mockingProductSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    stock: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

mockingProductSchema.plugin(mongoosePaginate)

mockingProductSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

const MockingProduct = mongoose.model('MockingProduct', mockingProductSchema)

export default MockingProduct
