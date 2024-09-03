import productRepository from '../repositories/productRepository.js'
import { generateMockProducts } from '../utils/generateMockProducts.js'
import MockingProduct from '../dao/models/mocking.model.js'

export const getProducts = async (query) => {
    const { limit = 10, page = 1, sort, query: searchQuery, categories } = query
    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort } : {},
    }

    let filter = {}
    if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: 'i' }
    }
    if (categories) {
        filter.category = { $in: categories.split(',') }
    }

    if (isNaN(options.page) || options.page < 1 || isNaN(options.limit) || options.limit < 1) {
        throw new Error('Número de página o límite inválido')
    }

    const products = await productRepository.getPaginatedProducts(filter, options)

    if (options.page > products.totalPages) {
        throw new Error('Página no encontrada')
    }

    return products
}

export const addProduct = async (name, description, price, stock, status, category, thumbnail) => {
    return await productRepository.addProduct(name, description, price, stock, status, category, thumbnail)
}

export const initializeMockProducts = async () => {
    await MockingProduct.deleteMany({})
    const products = generateMockProducts()
    await MockingProduct.insertMany(products)
    console.log('Mock products generated')
}
