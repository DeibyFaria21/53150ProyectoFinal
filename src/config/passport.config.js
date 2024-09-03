import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GitHubStrategy } from 'passport-github2'
import bcrypt from 'bcryptjs'

import User from '../dao/models/user.model.js'
import Cart from '../dao/models/cart.model.js'

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return done(null, false, { message: 'No user found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return done(null, false, { message: 'Password incorrect' })
        }
        return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/sessions/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.emails || !profile.emails[0].value) {
            return done(new Error('No se pudo obtener el email del usuario de GitHub. Por favor revisa la privacidad de tu cuenta de GitHub y vuelve a intentarlo'))
        }
        
        const email = profile.emails[0].value
        const profilePhoto = Array.isArray(profile.photos) ? profile.photos[0].value : '../public/uploads/default.jpg'

        let displayName = profile.displayName
        if (!displayName) {
            displayName = email.split('@')[0]
        }

        let user = await User.findOne({ email })

        if (!user) {
            user = new User({
                first_name: displayName,
                last_name: '',
                email: email,
                age: null,
                password: '',
                profile_image: profilePhoto
            })
            
            const newCart = new Cart()
            await newCart.save()
            user.cart = newCart._id
            
            await user.save()
            console.log(user)
        }
        return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('cart')
        done(null, user)
    } catch (err) {
        done(err)
    }
})

export default passport