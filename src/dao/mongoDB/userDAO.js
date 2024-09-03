import User from '../../models/userModel.js'

class UserDao {
    async findById(id) {
        return await User.findById(id)
    }

    async findByEmail(email) {
        return await User.findOne({ email })
    }

    async createUser(user) {
        return await User.create(user)
    }

    async updateUser(user) {
        return await user.save()
    }

    async deleteUserById(id) {
        return await User.findByIdAndDelete(id)
    }
}

export default UserDao
