import express from 'express'
import {
    getProducts,
    addProduct,
    getMockingProducts,
    regenerateMockingProducts,
    createProduct
} from '../controllers/productsController.js'

const router = express.Router()

router.get('/', getProducts)
router.post('/create', addProduct)

router.get('/mockingProducts', getMockingProducts)
router.post('/mockingProducts/regenerate', regenerateMockingProducts)
router.post('/mockingProducts/create', createProduct)

export default router
