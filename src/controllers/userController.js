import passport from 'passport'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
    updateProfile as updateProfileService,
    logoutUser as logoutUserService,
    registerUser as registerUserService
} from '../services/userService.js'
import User from '../dao/models/user.model.js'
import transporter from '../config/emailConfig.js'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET

export const registerUserHandler = async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body
    const userData = { first_name, last_name, email, age, password }

    try {
        await registerUserService(userData)
        return res.redirect('/login')
    } catch (error) {
        console.error('Error al registrar el usuario:', error)
        return res.redirect('/register')
    }
}

export const loginUserHandler = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/login')
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err)
            }
            if (user.role === 'admin') {
                return res.redirect('/adminDashboard')
            } else {
                return res.redirect('/products')
            }
        })
    })(req, res, next)
}

export const logoutUser = async (req, res) => {
    try {
        await logoutUserService(req)
        res.redirect('/login')
    } catch (error) {
        console.error('Error al cerrar sesión:', error)
        res.redirect('/profile')
    }
}

export const getProfile = async (req, res) => {
    const userId = req.user._id // Asegúrate de que req.user contiene el ID del usuario
    
    try {
        // Busca al usuario en la base de datos por su ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Devolver la información del usuario en formato JSON
        res.status(200).json({
            status: 'success',
            user: {
                first_name: user.first_name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
};


export const updateProfile = async (req, res) => {
    const userId = req.params.uid
    const profileData = req.body
    const file = req.file

    try {
        await updateProfileService(userId, profileData, file)
        res.redirect('/profile')
    } catch (error) {
        console.error('Error al actualizar el perfil:', error)
        res.redirect('/profile')
    }
}

export const changeUserRole = async (req, res) => {
    try {
        const userId = req.params.uid
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        user.role = user.role === 'user' ? 'premium' : 'user'
        await user.save()

        res.status(200).json({ message: 'Rol actualizado', role: user.role })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const githubAuth = passport.authenticate('github', { scope: ['user:email'] })
export const githubCallback = (req, res, next) => {
    passport.authenticate('github', {
        failureRedirect: '/login?error=Autenticación con GitHub fallida.',
        successRedirect: '/products'
    })(req, res, next)
}

export const sendPasswordResetLink = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })

        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`
        await transporter.sendMail({
            from: process.env.EMAIL_USER_NODEMAILER,
            to: email,
            subject: 'Restablecer contraseña',
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetLink}">Restablecer contraseña</a></p>`,
        })

        res.send('Correo enviado')
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error)
        res.status(500).send('Error al enviar el correo de recuperación')
    }
}

export const resetPassword = async (req, res) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(decoded.userId)
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Las contraseñas no coinciden')
        }

        const isSamePassword = await bcrypt.compare(password, user.password)
        if (isSamePassword) {
            return res.status(400).send('No puedes usar la misma contraseña')
        }

        user.password = password
        await user.save()

        res.send('Contraseña restablecida correctamente')
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.redirect('/forgot-password')
        }

        console.error('Error al restablecer la contraseña:', error)
        res.status(500).send('Error al restablecer la contraseña')
    }
}
