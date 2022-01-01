import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import UserModel from '../models/user.model.mjs'
import PostModel from '../models/post.model.mjs'
import TagModel from '../models/tag.model.mjs'
import env from 'dotenv'
import * as authHelpers from '../helpers/auth.helpers.mjs'
import * as authVariables from '../variables/auth.variables.mjs'


env.config()

const getProfile = async (req, res) => {
    const { username } = req.params
    const author = await UserModel.findByUsername(username)
    if (author) {
        let posts = await PostModel.filterByAuthor(author.username)
        posts = await Promise.all(posts.map(async post => {
            post.tags = await Promise.all(post.tags.map(async tagId => await TagModel.find(tagId)))
            return post
        }))
        return res.json({
            posts,
            author: {
                username: author.username,
                email: author.email,
            }
        })
    } else {
        return res.status(404).send('Not found')
    }
}

const updateProfile = async (req, res) => {
    const errors = validationResult(req).errors
    if (errors.length > 0) {
        return res.status(409).send('Invalid fields')
    }

    const { username, email } = req.body
    let user = await UserModel.findByUsername(req.username)
    if (!user) return res.status(409).send('Cannot update. Try again')
    try {
        await UserModel.updateUser(user._id, { username, email })

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
        const dataForAccessToken = { username }
        const accessToken = await authHelpers.generateToken(
            dataForAccessToken,
            accessTokenSecret,
            accessTokenLife
        )
        if (!accessToken) {
            return res.status(401).send('Cannot update. Try again')
        }
        return res.json({
            username,
            email,
            accessToken
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot update. Try again')
    }
}

const updatePassword = async (req, res) => {
    const errors = validationResult(req).errors
    if (errors.length > 0) {
        return res.status(409).send('Invalid fields')
    }

    const { password } = req.body
    let user = await UserModel.findByUsername(req.username)
    if (!user) return res.status(409).send('Cannot update. Try again')
    try {
        const salt = bcrypt.genSaltSync(authVariables.saltRouds)
        await UserModel.updateUser(user._id, {
            password: bcrypt.hashSync(password, salt)
        })

        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
        const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
        const dataForAccessToken = { username: req.username }
        const accessToken = await authHelpers.generateToken(
            dataForAccessToken,
            accessTokenSecret,
            accessTokenLife
        )
        if (!accessToken) {
            return res.status(401).send('Cannot update. Try again')
        }
        return res.json({
            username: req.username,
            accessToken
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot update. Try again')
    }
}


export {
    getProfile,
    updateProfile,
    updatePassword
}
