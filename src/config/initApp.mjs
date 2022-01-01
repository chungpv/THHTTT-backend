import cors from 'cors'
import env from 'dotenv'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import('express-async-errors')


env.config()
const initApp = app => {
    app.use(morgan("combined"))
    app.use(bodyParser.urlencoded({
        extended: false
    }))
    app.use(bodyParser.json())
    app.use(cors())
}

export default initApp
