import express from 'express'
import {
    getCart,
    updateCart,
    addProductToCart,
    updateProductQuantity,
    deleteProductFromCart,
    deleteAllProductsFromCart,
    getPurchase
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/:cid', getCart)
router.put('/:cid', updateCart)
router.post('/:cid/products/:pid', addProductToCart)
router.put('/:cid/products/:pid', updateProductQuantity)
router.delete('/:cid/products/:pid', deleteProductFromCart)
router.delete('/:cid', deleteAllProductsFromCart)
router.get('/:cid/purchase', getPurchase)
router.post('/:cid/purchase', getPurchase)

export default router
