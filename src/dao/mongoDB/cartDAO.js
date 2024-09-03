import Cart from '../models/cart.model.js'

class CartDAO {
    async getCartById(id) {
        return await Cart.findById(id).populate('products.product')
    }

    async getCartByIdRaw(id) {
        return await Cart.findById(id)
    }

    async updateCart(cart) {
        return await cart.save()
    }

    async deleteProductFromCart(cid, pid) {
        return await Cart.updateOne({ _id: cid }, { $pull: { products: { product: pid } } })
    }

    async deleteAllProductsFromCart(cid) {
        return await Cart.updateOne({ _id: cid }, { $set: { products: [] } })
    }
}

export default new CartDAO()
