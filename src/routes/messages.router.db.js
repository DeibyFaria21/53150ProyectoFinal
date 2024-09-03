import { Router } from 'express'
import { authorizeRoles } from '../middlewares/auth.js'
import messageModel from '../dao/models/message.model.js'

const router = Router()

router.get('/', authorizeRoles(['user', 'premium']), async (req, res) => {
    try {
        const messages = await messageModel.find().lean()
        res.render('chat',{
            messages : messages
        })
    } catch (error) {
        console.error('Error al cargar los mensajes:', error)
        res.status(500).render('error', { message: 'Error al cargar el chat, imagino' })
    }
})

router.post('/', authorizeRoles(['user', 'premium']), async (req, res) => {
    const { user, message } = req.body

    if (!message) {
    return res.status(400).send('Faltan parámetros')
    }

    let chating = await messageModel.create({ user, message})
    console.log(chating)
    res.redirect('/api/chat')
})

router.get('/:chid', authorizeRoles(['user', 'premium']), async (req, res) => {
    try {
        const { chid } = req.params
        await messageModel.findByIdAndDelete(chid)
        
        res.redirect('/api/chat')
    } catch (error) {
        console.error('Error al eliminar el producto:', error)
        res.status(500).render('error', { message: 'Error al eliminar el producto.' })
    }
})

export default router