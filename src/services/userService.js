import userRepository from '../repositories/userRepository.js'
import UserDTO from '../dto/userDTO.js'
import Cart from '../dao/models/cart.model.js'

export const registerUser = async (userData) => {
    try {
        const existingUser = await userRepository.getUserByEmail(userData.email)

        if (existingUser) {
            throw new Error('El email ya está en uso.')
        }

        const newUser = await userRepository.createUser(userData)
        const newCart = new Cart()
        await newCart.save()
        newUser.cart = newCart._id
        await newUser.save()

        return new UserDTO(newUser)
    } catch (error) {
        throw new Error('Error al registrar el usuario: ' + error.message)
    }
}

export const logoutUser = (req) => {
    return new Promise((resolve, reject) => {
        req.logout((err) => {
            if (err) {
                reject(new Error('Error al cerrar sesión'))
            } else {
                resolve()
            }
        })
    })
}

export const updateProfile = async (userId, profileData, file) => {
    try {
        const user = await userRepository.getUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        user.first_name = profileData.first_name || user.first_name
        user.last_name = profileData.last_name || user.last_name
        user.age = profileData.age || user.age

        if (file) {
            user.profile_image = `/uploads/${file.filename}`
        }

        await userRepository.updateUser(user)
        return new UserDTO(user)
    } catch (error) {
        throw new Error('Error al actualizar el perfil: ' + error.message)
    }
}

export const deleteUser = async (userId) => {
    try {
        const user = await userRepository.getUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        if (user.role !== 'admin') {
            await Cart.findByIdAndDelete(user.cart)
            await userRepository.deleteUser(userId)
            return new UserDTO(user)
        }
    } catch (error) {
        throw new Error('Error al eliminar el perfil: ' + error.message)
    }
}