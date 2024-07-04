import jwt from 'jsonwebtoken'
import { envs } from './envs'

const JWT_SEED = envs.JWT_SEED

export class JwtAdapter {

    constructor() { }

    static generateToken = (payload: any, duration: string = '2h') => {

        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (error, token) => {
                if (error) return resolve(null)
                resolve(token)
            })
        })
    }

    
    //! Concepto de generico en typescript

    static validateToken<T>(token: string):Promise<T | null> {

        return new Promise((resolve) => {
            jwt.verify(token, JWT_SEED, (error, decoded) => {
                if (error) return resolve(null)
                resolve(decoded as T)
            })
        })
    }
}