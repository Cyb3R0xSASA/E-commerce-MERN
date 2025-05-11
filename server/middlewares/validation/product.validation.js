import Joi from 'joi';
const base = {
    name: Joi.string().min(2).max(100).trim().required(),
    description: Joi.string().min(50).max(1500).trim().required(),
}

const ProductCreateValidationSchema = Joi.object({
    ...base,
    price: Joi.number().min(0).max(9999).precision(2).required(),
    category: Joi.string().required(),
});

const CategoryCreateValidationSchema = Joi.object({
    ...base,
});

const UpdateQuantityOfCartSchema = Joi.object({
    quantity: Joi.number().min(0).max(100).required(),
    id: Joi.string().required(),
});

export {
    ProductCreateValidationSchema,
    CategoryCreateValidationSchema,
    UpdateQuantityOfCartSchema,
}