import {
    getCartById,
    addProductToCart as addProductToCartService,
    updateProductQuantity as updateProductQuantityService,
    removeProductFromCart as removeProductFromCartService,
    clearCartProducts as clearCartProductsService,
    purchaseCart,
} from '../services/cartService.js'
import logger from '../utils/logger.js'
import Product from '../dao/models/product.model.js'
import Cart from '../dao/models/cart.model.js'

export const getCart = async (req, res) => {
    try {
        const { cid } = req.params
        const cart = await getCartById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' })
        }
        res.json({ status: 'success', message: 'Carrito', data: cart })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateCart = async (req, res) => {
    const { cid } = req.params
    const { products } = req.body

    try {
        const cart = await Cart.findById(cid).populate('products.product')
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' })
        }

        products.forEach(({ productId, quantity }) => {
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId)
            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity
            }
        })

        await cart.save()
        res.json({ status: 'success', cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body

    try {
        const product = await Product.findById(pid)
        if (!product) {
            logger.error(`Producto no encontrado`)
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' })
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            logger.error(`Carrito con cantidad inválida: ${cantidad}`)
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número mayor que 0' })
        }

        if (cantidad > product.stock) {
            logger.error(`Cantidad mayor al stock: ${cantidad}`)
            return res.status(400).json({ status: 'error', message: 'No hay suficiente stock' })
        }

        await addProductToCartService(cid, pid, cantidad)
        logger.info(`Producto agregado al carrito`)
        res.json({ status: 'success', message: 'Producto agregado al carrito' })
        /* res.redirect(`/carts/${cart}`); */
    } catch (err) {
        logger.error(`Error al agregar producto: ${err.message}`)
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body

    try {
        await updateProductQuantityService(cid, pid, cantidad)
        res.json({ status: 'success', message: 'Cantidad actualizada' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params

    try {
        await removeProductFromCartService(cid, pid)
        res.json({ status: 'success', message: 'Producto eliminado del carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteAllProductsFromCart = async (req, res) => {
    const { cid } = req.params

    try {
        await clearCartProductsService(cid)
        res.json({ status: 'success', message: 'Productos eliminados del carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const getPurchase = async (req, res) => {
    const { cid } = req.params
    const user = req.user

    try {
        const { ticket, unavailableProducts } = await purchaseCart(cid, user)
        
        if (!ticket) {
            return res.status(400).json({ status: 'error', message: 'No se pudo completar la compra.', unavailableProducts })
        }

        res.json({ status: 'success', message: 'Compra realizada', ticket })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}
