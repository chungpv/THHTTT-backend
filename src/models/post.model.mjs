import mongoose from 'mongoose'


const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tag"
        }
    ],
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: null },
    deletedAt: { type: Number, default: null }
})

PostSchema.statics = {
    createNew(post) {
        return this.create(post)
    },
    findWithId(id) {
        return this.findById(id).exec()
    },
    updatePost(id, post) {
        return this.findByIdAndUpdate(id, post).exec()
    },
    addTagToPost(id, tagId) {
        return this.findByIdAndUpdate(
            id,
            { $push: { tags: tagId } },
            { new: true, useFindAndModify: false }
        ).exec()
    },
    filterByAuthor(author) {
        return this.find({author}).exec()
    }
}

const postModel = mongoose.model("post", PostSchema)

export default postModel
