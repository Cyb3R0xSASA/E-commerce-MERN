import pkg from 'mongoose';
const { model, models, Schema } = pkg;

const productSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        minLength: 50,
        maxLength: 1000,
    },
    price: {
        type: Number,
        min: 0,
        max: 9999,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export const Product = models.Product || new model('Product', productSchema);