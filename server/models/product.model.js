import pkg from 'mongoose';
const { model, models, Schema } = pkg;

const productSchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1500,
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
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const categorySchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

export const Product = models.Product || new model('Product', productSchema);
export const Category = models.Category || new model('Category', categorySchema);