import { v4 as uuidv4 } from 'uuid'
import Ticket from '../dao/models/ticket.model.js'
import cartRepository from '../repositories/cartRepository.js'
import productRepository from '../repositories/productRepository.js'
import ticketRepository from '../repositories/ticketRepository.js'
import { sendPurchaseEmail } from '../utils/email.js'

export const getCartById = async (cartId) => {
    return await cartRepository.getCartById(cartId)
}

export const addProductToCart = async (cartId, productId, quantity) => {
    const cart = await cartRepository.getCartByIdRaw(cartId)
    if (!cart) {
        throw new Error('Carrito no encontrado')
    }

    const product = await productRepository.getProductById(productId)
    if (!product) {
        throw new Error('Producto no encontrado')
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId)
    if (productIndex > -1) {
        cart.products[productIndex].quantity += parseInt(quantity) || 1
    } else {
        cart.products.push({ product: productId, quantity: parseInt(quantity) || 1 })
    }

    return await cartRepository.updateCart(cart)
}

export const updateProductQuantity = async (cartId, productId, quantity) => {
    const quantityNumber = parseInt(quantity, 10)
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
        throw new Error('Cantidad inválida')
    }

    const cart = await cartRepository.getCartByIdRaw(cartId)
    if (!cart) {
        throw new Error('Carrito no encontrado')
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId)
    if (productIndex > -1) {
        cart.products[productIndex].quantity = quantityNumber
    } else {
        cart.products.push({ product: productId, quantity: quantityNumber })
    }

    return await cartRepository.updateCart(cart)
}

export const removeProductFromCart = async (cartId, productId) => {
    return await cartRepository.deleteProductFromCart(cartId, productId)
}

export const clearCartProducts = async (cartId) => {
    return await cartRepository.deleteAllProductsFromCart(cartId)
}

export const purchaseCart = async (cartId, user) => {
    const cart = await cartRepository.getCartByIdRaw(cartId)
    if (!cart) {
        throw new Error('Carrito no encontrado')
    }

    const unavailableProducts = []
    let totalAmount = 0
    const purchasedProducts = []

    for (const cartProduct of cart.products) {
        const productDTO = await productRepository.getProductById(cartProduct.product._id)
        const productId = productDTO.id

        if (productDTO.stock < cartProduct.quantity) {
            unavailableProducts.push(productId)
        } else {
            productDTO.stock -= cartProduct.quantity
            await productRepository.updateProductStock(productId, productDTO.stock)
            totalAmount += productDTO.price * cartProduct.quantity
            purchasedProducts.push({ product: productDTO, quantity: cartProduct.quantity })
        }
    }

    const purchasedProductsEmail = purchasedProducts.filter(p => !unavailableProducts.includes(p.product.id))

    if (purchasedProducts.length > 0) {
        const ticket = new Ticket({
            code: uuidv4(),
            amount: totalAmount,
            purchaser: user.email,
            products: purchasedProducts.map(p => ({ product: p.product.id, quantity: p.quantity }))
        })

        await ticketRepository.createTicket(ticket)

        cart.products = cart.products.filter(cartProduct => unavailableProducts.includes(cartProduct.product._id))
        await cartRepository.updateCart(cart)

        user.purchases.push(ticket._id)
        await user.save()

        await sendPurchaseEmail(user, purchasedProductsEmail, ticket.code, ticket.amount)
        return { ticket, unavailableProducts }
    } else {
        return { ticket: null, unavailableProducts }
    }
}
