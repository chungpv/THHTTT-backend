import PostModel from '../models/post.model.mjs'
import TagModel from '../models/tag.model.mjs'


const createPost = (title, tags_content, content, username) => {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await PostModel.createNew({ title, content, author: username })
            const tags = await Promise.all(tags_content.map(tag => TagModel.findOneOrCreate({ content: tag })))
            for await (const tag of tags) {
                await PostModel.addTagToPost(post._id, tag._id)
                await TagModel.addPostToTag(tag._id, post._id)
            }
            resolve(await PostModel.findWithId(post._id))
        } catch (error) {
            reject(error)
        }
    })
}

const updatePost = (oldPost, title, tags_content, content) => {
    return new Promise(async (resolve, reject) => {
        try {
            for await (const tagId of oldPost.tags) {
                await TagModel.deletePostFromTag(tagId, oldPost._id)
            }
            const newPost = await PostModel.updatePost(oldPost._id, { title, content, tags: [] })
            const tags = await Promise.all(tags_content.map(tag => TagModel.findOneOrCreate({ content: tag })))
            for await (const tag of tags) {
                await PostModel.addTagToPost(newPost._id, tag._id)
                await TagModel.addPostToTag(tag._id, newPost._id)
            }
            resolve(await PostModel.findWithId(newPost._id))
        } catch (error) {
            reject(error)
        }
    })
}

const deletePost = post => {
    return new Promise(async (resolve, reject) => {
        try {
            for await (const tagId of post.tags) {
                await TagModel.deletePostFromTag(tagId, post._id)
            }
            resolve(await PostModel.deleteOne({ post }))
        } catch (error) {
            reject(error)
        }
    })
}

export {
    createPost,
    updatePost,
    deletePost
}
