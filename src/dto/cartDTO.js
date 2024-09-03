class CartDTO {
    constructor(cart) {
        this.id = cart._id
        this.products = cart.products.map(product => ({
            id: product._id,
            productId: product.product._id,
            quantity: product.quantity,
            name: product.product.name,
            price: product.product.price
        }))
    }
}

export default CartDTO
