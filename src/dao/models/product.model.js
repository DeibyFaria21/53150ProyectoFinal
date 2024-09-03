import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    availability: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    thumbnail: { type: String },
    owner: { type: mongoose.Schema.Types.String, ref: 'User', default: 'admin' }
}, { timestamps: true })

productSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', productSchema)

export default Product