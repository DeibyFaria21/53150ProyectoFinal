import ProductDaoMongo from '../dao/mongoDB/productDAO.js'
import ProductDTO from '../dto/productDTO.js'
import Product from '../dao/models/product.model.js'

const productDao = new ProductDaoMongo()

export default {
    getProducts: async () => {
        const products = await productDao.findAll()
        return products.map(product => new ProductDTO(product))
    },

    getProductById: async (id) => {
        const product = await productDao.findById(id)
        if (product) {
            return new ProductDTO(product)
        }
        throw new Error('Product not found')
    },

    createProduct: async (productData) => {
        const newProduct = await productDao.createProduct(productData)
        return new ProductDTO(newProduct)
    },

    addProduct: async (name, description, price, stock, status, category, thumbnail) => {
        return await Product.create({ name, description, price, stock, status, category, thumbnail })
    },

    updateProduct: async (productData) => {
        const updatedProduct = await productDao.updateProduct(productData)
        return new ProductDTO(updatedProduct)
    },

    deleteProductById: async (id) => {
        await productDao.deleteProductById(id)
        return { message: 'Product deleted successfully' }
    },

    updateProductStock: async (id, stock) => {
        const product = await productDao.findById(id)
        if (!product) {
            throw new Error('Product not found')
        }
        product.stock = stock
        const updatedProduct = await productDao.updateProduct(product)
        return new ProductDTO(updatedProduct)
    },

    getPaginatedProducts: async (filter, options) => await Product.paginate(filter, options),

}
