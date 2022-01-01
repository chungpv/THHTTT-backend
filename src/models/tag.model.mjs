import mongoose from 'mongoose'


const TagSchema = new mongoose.Schema({
    content: { type: String, unique: true, required: true },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ],
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: null },
    deletedAt: { type: Number, default: null }
})

TagSchema.statics = {
    createNew(tag) {
        return this.create(tag)
    },
    find(id) {
        return this.findById(id).exec()
    },
    findByContent(content) {
        return this.findOne({ "content": content }).exec()
    },
    findOneOrCreate(tag) {
        const { content } = tag
        const self = this
        return self.findByContent(content)
            .then(record => record || self.createNew(tag)).catch(error => error)
    },
    addPostToTag(id, postId) {
        return this.findByIdAndUpdate(
            id,
            { $push: { posts: postId } },
            { new: true, useFindAndModify: false }
        ).exec()
    },
    deletePostFromTag(id, postId) {
        return this.findByIdAndUpdate(
            id,
            { $pull: { posts: postId } },
            { new: true, useFindAndModify: false }
        ).exec()
    }
}

const tagModel = mongoose.model("tag", TagSchema)

export default tagModel
