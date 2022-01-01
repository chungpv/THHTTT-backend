import mongoose from 'mongoose'
import bcrypt from 'bcrypt'


const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    role: {type: String, enum: ["admin", "user"], required: true, default: "user"},
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: null },
    deletedAt: { type: Number, default: null }
})

UserSchema.statics = {
    createNew(user) {
        return this.create(user)
    },
    find(id) {
        return this.findById(id).exec()
    },
    findByEmail(email) {
        return this.findOne({ "email": email }).exec()
    },
    findByUsername(username) {
        return this.findOne({ "username": username }).exec()
    },
    updateUser(id, user) {
        return this.findByIdAndUpdate(id, user).exec()
    }
}

UserSchema.methods = {
    comparePassword(password) {
        return bcrypt.compare(password, this.password)
    }
}

const userModel = mongoose.model("user", UserSchema)

export default userModel
