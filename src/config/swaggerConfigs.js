import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Ecommerce',
            description: 'Documentación de la API',
        },
        servers: [
            {
                url: 'http://localhost:8080',
            },
        ],
    },
    apis: ['src/docs/**/*.yaml'],
}

const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

export default swaggerDocs