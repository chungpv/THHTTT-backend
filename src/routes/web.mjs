import express from "express"
import createError from 'http-errors'
import {
    authController,
    postController,
    tagController,
    userController
} from '../controllers/index.mjs'
import { authValidator, postValidator, userValidator } from "../validators/index.mjs"


const router = express.Router()
const initRoutes = app => {
    router.post('/auth/register',
        authValidator.register,
        authController.register
    )
    router.post('/auth/login',
        authValidator.login,
        authController.login
    )
    router.post('/auth/refresh',
        authController.refreshToken
    )
    router.post('/auth/current_user',
        authController.checkLoggedIn,
        authController.currentUser
    )
    router.get('/users/:username',
        userController.getProfile
    )
    router.put('/updateProfile',
        authController.checkLoggedIn,
        userValidator.validateProfile,
        userController.updateProfile
    )
    router.put('/updatePassword',
        authController.checkLoggedIn,
        userValidator.validatePassword,
        userController.updatePassword
    )
    router.post('/posts/new',
        authController.checkLoggedIn,
        postValidator.newPost,
        postController.createPost
    )
    router.get('/posts/:postId',
        postController.checkExistPost,
        postController.getSinglePost
    )
    router.get('/posts/:postId/edit',
        authController.checkLoggedIn,
        postController.checkExistPost,
        postController.checkAuthorPost,
        postController.postEditting
    )
    router.put('/posts/:postId',
        authController.checkLoggedIn,
        postController.checkExistPost,
        postController.checkAuthorPost,
        postValidator.updatePost,
        postController.updatePost
    )
    router.delete('/posts/:postId',
        authController.checkLoggedIn,
        postController.checkExistPost,
        postController.checkAuthorPost,
        postController.deletePost
    )
    router.get('/tags/:tagId',
        tagController.getTag
    )

    app.use("/api/v1/", router)
    app.use((req, res, next) => {
        next(createError(404))
    })
    app.use((err, req, res) => {
        console.log(err.stack);
        res.status(err.status || 500).send(err.message)
    })
}

export default initRoutes
