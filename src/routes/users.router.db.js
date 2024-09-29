import express from 'express'
import {
    logoutUser,
    updateProfile,
    updateDocumentsProfile,
    getProfile,
    adminDeleteUser,
    deleteInactiveUsers,
    adminChangeUserRole,
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
router.post('/profile/:uid/documents', upload.fields([
    { name: 'documents[identification]', maxCount: 1 },
    { name: 'documents[proofOfAddress]', maxCount: 1 },
    { name: 'documents[accountStatement]', maxCount: 1 }
]), updateDocumentsProfile)
router.get('/profile', getProfile)
router.delete('/adminViewAllUsers/:uid', adminDeleteUser)
router.delete('/adminViewAllUsers', deleteInactiveUsers)
router.post('/adminViewAllUsers/:uid/role', adminChangeUserRole)

router.post('/login', loginUserHandler)
router.post('/register', registerUserHandler)
router.post('/forgot-password', sendPasswordResetLink)
router.post('/reset-password/:token', resetPassword)
router.put('/premium/:uid', changeUserRole)

router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

export default router
