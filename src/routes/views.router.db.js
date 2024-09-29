import express from 'express'
import dotenv from 'dotenv'
import { authorizeRoles, checkUser } from '../middlewares/auth.js'
import User from '../dao/models/user.model.js'
import Cart from '../dao/models/cart.model.js'
import Product from '../dao/models/product.model.js'
import Message from '../dao/models/message.model.js'
import logger from '../utils/logger.js'
import transporter from '../config/emailConfig.js'

dotenv.config()
const router = express.Router()

router.get('/products', checkUser, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const query = req.query.query || '';
        const category = req.query.category || '';
        const sort = req.query.sort || '';

        // Construir filtro dinámico
        const filter = {};

        if (query) {
            filter.name = { $regex: query, $options: 'i' }; // Filtrado por nombre (query)
        }

        if (category) {
            filter.category = category; // Filtrado por categoría
        }

        // Construir opciones de ordenamiento
        const sortOptions = {};
        if (sort) {
            if (sort === 'asc') {
                sortOptions.price = 1;
            } else if (sort === 'desc') {
                sortOptions.price = -1;
            }
        }

        // Calcular el número total de productos que cumplen los filtros
        const totalProducts = await Product.countDocuments(filter);

        // Calcular paginación
        const totalPages = Math.ceil(totalProducts / limit);
        const skip = (page - 1) * limit;

        // Obtener productos con filtros y ordenamiento aplicados
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        const buildLink = (pageNum) => {
            let link = `/products?page=${pageNum}&limit=${limit}`;
            if (query) link += `&query=${query}`;
            if (category) link += `&category=${category}`;
            if (sort) link += `&sort=${sort}`;
            return link;
        };

        const prevLink = page > 1 ? buildLink(page - 1) : null;
        const nextLink = page < totalPages ? buildLink(page + 1) : null;

        // Construir objeto de respuesta con información de paginación
        const response = {
            status: 'success',
            payload: products,
            pagination: {
                totalPages: totalPages,
                currentPage: page,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevLink: prevLink,
                nextLink: nextLink
            }
        };

        res.render('home', { payload: response, user: res.locals.user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});


router.get('/products/:pid', checkUser, async (req, res) => {
    try {
        const productId = req.params.pid
        const product = await Product.findById(productId).lean()

        res.render('detail', {
            product,
            cartId: res.locals.cart ? res.locals.cart._id : null,
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el producto:', error)
        res.status(500).render('detail', { error: error.message })
    }
})


const getPopulatedCart = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId).populate('products.product').lean()
        return cart
    } catch (error) {
        throw new Error('Error al obtener el carrito')
    }
}

router.get('/carts/:cid', authorizeRoles(['user', 'premium']), async (req, res) => {
    const cartId = req.params.cid || res.locals.cartId
    try {
        const cart = await getPopulatedCart(cartId)

        res.render('cartDetail', {
            cart: cart,
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        res.status(500).render('cartDetail', { error: error.message })
    }
})

router.get('/profile', authorizeRoles(['user', 'premium']), async (req, res) => {
    res.render('profile', {
        user: res.locals.user
    })
})

router.get('/profile/:uid/documents', authorizeRoles(['user', 'premium']), async (req, res) => {
    res.render('uploadDocuments', {
        user: res.locals.user
    })
})

router.get('/:cid/purchase', authorizeRoles(['user', 'premium']), async (req, res) => {
    try {
        const cartId = req.params.cid
        const cart = await getPopulatedCart(cartId)

        res.render('purchase', {
            cart,
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        res.status(500).render('purchase', { error: error.message })
    }
})

router.get('/adminDashboard', authorizeRoles(['admin', 'premium']), async (req, res) => {
    try {
        const user = req.user
        let products

        if (user.role === 'admin') {
            products = await Product.find().lean()
        } else if (user.role === 'premium') {
            products = await Product.find({ owner: user.email })
        }

        res.render('adminDashboard', {
            user,
            products,
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al obtener los productos')
    }
})

router.get('/addProduct', authorizeRoles(['premium', 'admin']), (req, res) => {
    res.render('addProduct',{
        user: res.locals.user
    })
})

router.post('/addProduct', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        let { name, description, price, category, availability, stock, thumbnail } = req.body

        if (!name || !description || !price || !category || !availability || !stock || !thumbnail) {
            return res.status(400).json({ error: 'Faltan parámetros' })
        }

        let owner = req.user.role === 'admin' ? 'admin' : req.user.email

        let newProduct = await Product.create({
            name,
            description,
            price,
            category,
            availability,
            stock,
            thumbnail,
            owner
        })

        logger.info(`Producto creado: ${newProduct}`)
        if (req.user.role === 'admin') {
            return res.redirect('/adminDashboard')
        } else {
            return res.redirect('/products')
        }
    } catch (error) {
        console.error('Error al agregar un nuevo producto:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.get('/adminUpdateProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        const productById = await Product.findByIdAndUpdate(req.params.pid).lean()
        res.render('updateProduct', {
            productById,
            user: res.locals.user
        })
    } catch (error) {
        console.log(error.message)
    }
})

router.post('/adminUpdateProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        let { pid } = req.params
        await Product.findByIdAndUpdate(pid, req.body)
        res.redirect('/adminDashboard')
    } catch (error) {
        console.error('Error al actualizar el producto:', error)
        res.status(500).render('error', { message: 'Error al actualizar el producto.' })
    }
})

router.delete('/adminDeleteProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    let { pid } = req.params
    let result = await Product.deleteOne({ _id: pid })
    res.send({ result: "success", payload: result })
})

export const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER_NODEMAILER,
            to,
            subject,
            text,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(`Error al enviar correo a ${to}:`, error)
    }
}

router.get('/adminDeleteProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        const { pid } = req.params
        const product = await Product.findById(pid)

        if (!product) {
            return res.status(404).render('error', { message: 'Producto no encontrado.' })
        }

        if (product.owner !== 'admin') {
            await sendEmail(
                product.owner,
                'Producto Eliminado',
                `Tu producto "${product.name}" ha sido eliminado.`
            )
        }

        await Product.findByIdAndDelete(pid)

        res.redirect('/adminDashboard')
    } catch (error) {
        console.error('Error al eliminar el producto:', error)
        res.status(500).render('error', { message: 'Error al eliminar el producto.' })
    }
})

router.get('/adminViewAllUsers', authorizeRoles(['admin']), async (req, res) => {
    try {
        const users = await User.find().lean()
        res.render('adminViewAllUsers', {
            users,
            style: 'style.css'
        })
    } catch (error) {
        console.error('Error al obtener los usuarios:', error)
        res.status(500).send('Error al obtener los usuarios')
    }
})

router.get('/login', async (req, res) => {
    res.render('login')
})

router.get('/register', async (req, res) => {
    res.render('register')
})

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password')
})

router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params
    let expired = false

    try {
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        expired = true
    }

    res.render('reset-password', {
        token,
        expired
    })
})



export default router
