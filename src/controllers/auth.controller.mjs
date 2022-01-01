import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import UserModel from '../models/user.model.mjs'
import * as authVariables from '../variables/auth.variables.mjs'
import env from 'dotenv'
import * as authHelpers from '../helpers/auth.helpers.mjs'
import randToken from 'rand-token'


env.config()

const register = async (req, res) => {
    const errors = validationResult(req).errors
    if (errors.length > 0) {
        return res.status(401).send('Invalid fields')
    }

    const { username, email, password } = req.body
    let user = await UserModel.findByUsername(username)
    if (user) return res.status(401).send('Username is already registered')
    user = await UserModel.findByEmail(email)
    if (user) return res.status(401).send('Email is already registered')

    const salt = bcrypt.genSaltSync(authVariables.saltRouds)
    const newUser = {
        username: username,
        email: email,
        password: bcrypt.hashSync(password, salt)
    }

    const createdUser = await UserModel.createNew(newUser)
    if (!createdUser) {
        return res.status(401).send('Cannot register. Try again')
    }

    const role = createdUser.role
    return res.json({
        username,
        role
    })
}

const login = async (req, res) => {
    const { username, password } = req.body
    const user = await UserModel.findByUsername(username)
    if (!(user && (await user.comparePassword(password)))) {
        return res.status(401).send('Username or password is incorrect')
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const dataForAccessToken = { username: user.username }
    const accessToken = await authHelpers.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
    )
    if (!accessToken) {
        return res.status(401).send('Cannot login. Try again')
    }

    let refreshToken
    if (!user.refreshToken) {
        refreshToken = randToken.generate(authVariables.refreshTokenSize)
        try {
            await UserModel.updateUser(user._id, { refreshToken: refreshToken })
        } catch (error) {
            return res.status(401).send('Cannot login. Try again')
        }
    } else {
        refreshToken = user.refreshToken
    }

    return res.json({
        accessToken,
        role: user.role,
        username: user.username
    })
}

const refreshToken = async (req, res) => {
    const accessTokenFromHeader = req.headers["x_access_token"]
    const refreshTokenFromBody = req.body.refreshToken
    if (!(accessTokenFromHeader && refreshTokenFromBody)) {
        return res.status(400).send('Invalid access token or refresh token')
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const decoded = await authHelpers.decodeToken(accessTokenFromHeader, accessTokenSecret)
    if (!decoded) {
        return res.status(400).send('Cannot decode access token')
    }
    const { username } = decoded.payload
    const user = await UserModel.findByUsername(username)
    if (!user) {
        return res.status(401).send('Cannot find account')
    } else if (user.refreshToken !== refreshTokenFromBody) {
        return res.status(400).send('Refresh token is invalid')
    }

    const dataForAccessToken = { username }
    const accessToken = await authHelpers.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
    )
    if (!accessToken) {
        return res.status(401).send('Cannot create access token')
    }
    return res.json({
        accessToken
    })
}

const logout = async (req, res) => {
    return res.json({
        accessToken: null
    })
}

const currentUser = async (req, res) => {
    return res.json({
        username: req.username,
        role: req.role
    })
}

const checkLoggedIn = async (req, res, next) => {
    const accessTokenFromHeader = req.headers["x_access_token"]
    if (!accessTokenFromHeader) {
        return res.status(400).send('Invalid access token or refresh token')
    }
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    const verified = await authHelpers.verifyToken(accessTokenFromHeader, accessTokenSecret)
    if (!verified) {
        return res.status(400).send('Not permition')
    }
    const user = await UserModel.findByUsername(verified.payload.username)
    if (!user) return res.status(400).send('Not permition')

    req.username = user.username
    req.role = user.role
    return next()
}


export {
    checkLoggedIn,
    register,
    login,
    logout,
    currentUser,
    refreshToken
}
