import jwt from 'jsonwebtoken'
import { promisify } from 'util'


const sign = promisify(jwt.sign).bind(jwt)
const verify = promisify(jwt.verify).bind(jwt)

const generateToken = async (payload, secretSignature, tokenLife) => {
    try {
        return await sign(
            { payload },
            secretSignature,
            {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            }
        )
    } catch (error) {
        console.log(error)
        return null
    }
}

const decodeToken = async (token, secretKey) => {
    try {
        return await verify(token, secretKey, {
            ignoreExpiration: true
        })
    } catch (error) {
        console.log(error)
        return null
    }
}

const verifyToken = async (token, secretKey) => {
    try {
        return await verify(token, secretKey)
    } catch (error) {
        console.log(error)
        return null
    }
}

export {
    generateToken,
    decodeToken,
    verifyToken
}
