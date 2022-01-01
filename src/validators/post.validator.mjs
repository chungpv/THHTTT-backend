import { body } from 'express-validator'


const newPost = [
    body('title').not().isEmpty().trim().escape(),
    body('tags').custom((value, { req }) => {
        if (value.some(e => e.length === 0)) {
            throw new Error('One of tags is empty')
        }
        return true
    }),
    body('content').not().isEmpty()
]

const updatePost = newPost

export {
    newPost,
    updatePost
}
