import pkg from 'mongoose';
const { model, models, Schema } = pkg;
import { Password } from '../utils/password.js';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, 'Password must be at least 8 characters'],
    },
    isActivate: {
        type: Boolean,
        default: false,
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1,
            },
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            }
        }
    ],
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    }
}, {
    timestamps: true
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = Password.hashPassword(this.password);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return Password.comparePassword(candidatePassword, this.password);
};


export const User = models.User || model('User', userSchema)
