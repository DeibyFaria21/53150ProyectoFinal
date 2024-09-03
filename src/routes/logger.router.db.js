import express from 'express'
import logger from '../utils/logger.js'

const router = express.Router()

router.get('/loggerTest', (req, res) => {
    const { level } = req.query
    const message = `This is a ${level} log message`

    switch(level) {
        case 'debug':
            logger.debug(message)
            break
        case 'http':
            logger.http(message)
            break
        case 'info':
            logger.info(message)
            break
        case 'warning':
            logger.warning(message)
            break
        case 'error':
            logger.error(message)
            break
        case 'fatal':
            logger.log('fatal', message)
            break
        default:
            return res.status(400).json({ message: 'Invalid log level' })
    }
    res.json({ message: `Logged a ${level} message` })
})

export default router
