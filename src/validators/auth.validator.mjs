import { body } from 'express-validator'


const register = [
    body('username').not().isEmpty().isAlphanumeric().trim().escape().toLowerCase(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 100 }),
    body('passwordConfirmation').custom((value, { req }) => {
        return value === req.body.password
    })
]

const login = [
    body('username').escape().toLowerCase()
]

export {
    register,
    login
}
