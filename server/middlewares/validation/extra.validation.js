import Joi from 'joi';

const UpdateQuantityOfCartSchema = Joi.object({
    quantity: Joi.number().min(0).max(100).required(),
    id: Joi.string().required(),
});

const ValidationCouponSchema = Joi.object({
    code: Joi.string().required(),
})

export {
    UpdateQuantityOfCartSchema,
    ValidationCouponSchema,
}