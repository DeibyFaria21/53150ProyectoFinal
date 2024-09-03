import cartDAO from '../dao/mongoDB/cartDAO.js'
import CartDTO from '../dto/cartDTO.js'

class CartRepository {
    async getCartById(id) {
        const cart = await cartDAO.getCartById(id)
        return cart ? new CartDTO(cart) : null
    }

    async getCartByIdRaw(id) {
        return await cartDAO.getCartByIdRaw(id)
    }

    async updateCart(cart) {
        const updatedCart = await cartDAO.updateCart(cart)
        return new CartDTO(updatedCart)
    }

    async deleteProductFromCart(cid, pid) {
        await cartDAO.deleteProductFromCart(cid, pid)
    }

    async deleteAllProductsFromCart(cid) {
        await cartDAO.deleteAllProductsFromCart(cid)
    }
}

export default new CartRepository()
