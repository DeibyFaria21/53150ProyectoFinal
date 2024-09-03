class ProductDTO {
    constructor({ _id, name, price, description, category, stock }) {
        this.id = _id
        this.name = name
        this.price = price
        this.description = description
        this.category = category
        this.stock = stock
    }
}

export default ProductDTO