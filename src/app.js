import express from 'express'
import swaggerDocs from './config/swaggerConfigs.js'
import dotenv from 'dotenv'
import session from 'express-session'
import mongoose from './config/dbConfig.js'
import passport from 'passport'
import methodOverride from 'method-override'
import MongoStore from 'connect-mongo'
import path from 'path'
import bodyParser from 'body-parser'
import { engine } from 'express-handlebars'
import { createServer } from 'http'
import { fileURLToPath } from 'url'

import productsRouter from './routes/products.router.db.js'
import userRouter from './routes/users.router.db.js'
import cartRouter from './routes/carts.router.db.js'
import messagesRouter from './routes/messages.router.db.js'
import viewsRouter from './routes/views.router.db.js'
import loggerRouter from './routes/logger.router.db.js'
import logger from './utils/logger.js'
import './config/passport.config.js'
import handleErrors from './middlewares/errorHandler.js'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
swaggerDocs(app)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 60 * 60 * 1000
    }),
    cookie: { 
        secure: false,
        maxAge: 60 * 60 * 1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(handleErrors)
app.use(bodyParser.json())

app.use(methodOverride('_method'));

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user.toJSON()
        res.locals.cart = req.user.cart
    }
    next()
});

app.engine('handlebars', engine({
    helpers: {
        equals: (a, b) => String(a) === String(b),
        different: (a, b) => String(a) !== String(b),
        calculateSubtotal: (price, quantity) => price * quantity,
        calculateTotal: (products) => {
            return products.reduce((total, product) => {
                return total + (product.product.price * product.quantity)
            }, 0)
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use((err, req, res, next) => {
    logger.error(`${err.message}`)
    res.status(500).send('Algo salió mal!')
})

app.use('/api/products', productsRouter)
app.use('/api/carts', cartRouter)
app.use('/api/chat', messagesRouter)
app.use('/api/sessions', userRouter)
app.use('/', viewsRouter)
app.use('/', loggerRouter)

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`Server is running on:${PORT}`)
    console.log(`Productos: http://localhost:${PORT}/products`)
})
