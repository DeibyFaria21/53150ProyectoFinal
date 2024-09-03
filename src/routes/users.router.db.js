import express from 'express'
import {
    logoutUser,
    updateProfile,
    getProfile,
    loginUserHandler,
    registerUserHandler,
    sendPasswordResetLink,
    resetPassword,
    changeUserRole,
    githubAuth,
    githubCallback,
} from '../controllers/userController.js'
import upload from '../middlewares/upload.js'

const router = express.Router()

router.post('/logout', logoutUser)
router.post('/profile/:uid', upload.single('profileImage'), updateProfile)
router.get('/profile', getProfile)

router.post('/login', loginUserHandler)
router.post('/register', registerUserHandler)
router.post('/forgot-password', sendPasswordResetLink)
router.post('/reset-password/:token', resetPassword)
router.put('/premium/:uid', changeUserRole)

router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

export default router
