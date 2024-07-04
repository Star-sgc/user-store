import mongoose, { mongo } from "mongoose"

interface ConnectionOptions{
    mongoUrl: string
    dbName: string
}

export class MongoDatabase {

    public static async connect(options: ConnectionOptions){
        
        const {dbName, mongoUrl} = options

        try {
            await mongoose.connect(mongoUrl, {
                dbName: dbName
            })
            console.log('Mongo connected')
            return true
        } catch (error) {
            console.log(`Mongo connection error`)
            throw error
        }
    }

    public static async disconnect(){
        await mongoose.disconnect()
    }
}