import { body } from 'express-validator'


const validateProfile = [
    body('username').not().isEmpty().isAlphanumeric().trim().escape().toLowerCase(),
    body('email').isEmail().normalizeEmail(),
]

const validatePassword = [
    body('password').isLength({ min: 8, max: 100 })
]

export {
    validateProfile,
    validatePassword
}
