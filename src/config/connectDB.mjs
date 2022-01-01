import mongoose from 'mongoose'
import bluebird from 'bluebird'
import env from 'dotenv'


env.config()
const connectDB = () => {
    mongoose.Promise = bluebird
    const URI = process.env.URI_DATABASE
    return mongoose.connect(URI)
}

export default connectDB
