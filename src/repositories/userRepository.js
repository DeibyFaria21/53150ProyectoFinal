import User from '../dao/models/user.model.js'

const userRepository = {
    getUsers: async () => await User.find(),
    getUserById: async (id) => await User.findById(id),
    updateUser: async (userData) => await User.findByIdAndUpdate(userData._id, userData, { new: true }),
    deleteUser: async (id) => await User.findByIdAndDelete(id),
    getUserByEmail: async (email) => await User.findOne({ email }),
    createUser: async (userData) => await User.create(userData),
}

export default userRepository
