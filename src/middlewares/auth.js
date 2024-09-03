export const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/login')
        }

        if (!roles.includes(req.user.role)) {
            return res.redirect('/login')
        }
        next()
    }
}

export const checkUser = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user
    }
    next()
}