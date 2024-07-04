import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    available: {
        type: Boolean,
        default: false
    },
    price:{
        type: Number,
        default: 0,
    },
    description:{
        type: String,
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
    }
})

productSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret, options) {
        delete ret._id
        delete ret.id
    },
})

export const ProductModel = mongoose.model('Product', productSchema)