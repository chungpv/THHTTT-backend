import env from 'dotenv'
import PostModel from '../models/post.model.mjs'
import TagModel from '../models/tag.model.mjs'
import UserModel from '../models/user.model.mjs'


env.config()

const getTag = async (req, res) => {
    const { tagId } = req.params

    try {
        const tag = await TagModel.find(tagId)
        if (tag) {
            let postIds = tag.posts
            const items = await Promise.all(postIds.map(async postId => {
                let post = await PostModel.findWithId(postId)
                post.tags = await Promise.all(post.tags.map(async tagId => await TagModel.find(tagId)))
                const author = await UserModel.findByUsername(post.author)
                return {
                    post,
                    author: {
                        username: author.username,
                        email: author.email
                    }
                }
            }))
            return res.json({ items })
        } else {
            return res.json({})
        }
    } catch (error) {
        console.log(error)
        return res.status(401).send('Cannot create. Try again')
    }
}

export {
    getTag
}
