import Joi from 'joi';

const ProductCreateValidationSchema = Joi.object({
    name: Joi.string().alphanum().min(2).max(100).trim().required(),
    description: Joi.string().min(50).max(1500).trim().required(),
    price: Joi.number().min(0).max(9999).precision(2).required(),
    category: Joi.string().alphanum().required(),
});

export {
    ProductCreateValidationSchema,
}