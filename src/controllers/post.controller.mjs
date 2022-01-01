import { validationResult } from 'express-validator'
import env from 'dotenv'
import * as postService from '../services/post.service.mjs'
import PostModel from '../models/post.model.mjs'
import TagModel from '../models/tag.model.mjs'
import UserModel from '../models/user.model.mjs'


env.config()

const createPost = async (req, res) => {
    const errors = validationResult(req).errors
    if (errors.length > 0) {
        return res.status(409).send('Invalid fields')
    }

    const { title, content } = req.body
    const { username } = req
    let tags = req.body.tags.map(e => e.toLowerCase())
    try {
        const post = await postService.createPost(title, tags, content, username)
        return res.json({
            id: post._id
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot create. Try again')
    }
}

const getSinglePost = async (req, res) => {
    try {
        let { post } = req
        const author = await UserModel.findByUsername(post.author)
        post.tags = await Promise.all(post.tags.map(async tagId => await TagModel.find(tagId)))
        return res.json({
            post,
            author: {
                username: author.username,
                email: author.email,
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot get post. Try again')
    }
}

const checkExistPost = async (req, res, next) => {
    try {
        const { postId } = req.params
        const post = await PostModel.findWithId(postId)
        req.post = post
        return next()
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot found. Try again')
    }
}

const checkAuthorPost = async (req, res, next) => {
    const { username, post } = req
    if (username === post.author) {
        return next()
    } else {
        return res.status(401).send('Not permittion')
    }
}

const postEditting = async (req, res) => {
    const { post } = req
    const tags = await Promise.all(post.tags.map(tagId => TagModel.find(tagId)))
    return res.json({ post, tags })
}

const updatePost = async (req, res) => {
    const errors = validationResult(req).errors
    if (errors.length > 0) {
        return res.status(409).send('Invalid fields')
    }

    const { title, content } = req.body
    let tags = req.body.tags.map(e => e.toLowerCase())
    try {
        const post = await postService.updatePost(req.post, title, tags, content)
        return res.json({
            id: post._id
        })
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot update. Try again')
    }
}

const deletePost = async (req, res) => {
    const { post } = req
    try {
        const { deletedCount } = await postService.deletePost(post)
        return res.json({ deletedCount })
    } catch (error) {
        return res.status(401).send('Cannot delete. Try again')
    }
}

export {
    createPost,
    checkExistPost,
    getSinglePost,
    checkAuthorPost,
    postEditting,
    updatePost,
    deletePost
}
