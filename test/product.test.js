import chai from 'chai'
import supertest from 'supertest'

const expect = chai.expect
const request = supertest('http://localhost:8080')

describe('Testing Products Endpoints', function () {
    this.timeout(5000)
    
    let productId = ''

    this.beforeEach(async () => {
        productId = '66b54a70ef08530b64b4d5c8'
    })

    it('Debe obtener la lista de productos', async () => {
        const response = await request.get('/api/products')
        
        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal('success')
        expect(response.body.payload).to.be.an('array')
        expect(response.body).to.have.property('totalPages')
        expect(response.body).to.have.property('page')
    })

    it('Debe crear un mockProduct nuevo', async () => {
        const productData = {
            _id: '270aa2fc-f95d-44d2-a931-d72caba485fx',
            name: 'Test Product',
            price: 100,
            description: 'Test Description',
            category: 'Test Category',
            stock: 50,
            thumbnail: 'test-image-url'
        }

        const response = await request.post('/api/products/mockingProducts/create').send(productData)
        
        expect(response.status).to.equal(201)
        expect(response.body.status).to.equal('success')
        expect(response.body.message).to.equal('Producto creado correctamente')
        expect(response.body.product).to.have.property('_id')
    })

    it('Debe obtener la lista de productos mockeados', async () => {
        const response = await request.get('/api/products/mockingProducts')
        
        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal('success')
        expect(response.body.payload).to.be.an('array')
    })
})
