import { Types } from "mongoose";
import { HTTP_STATUS } from "../config/constants.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { ProductCreateValidationSchema } from "../middlewares/validation/product.validation.js";
import { Product } from '../models/product.model.js';
import { imageCheck } from "../services/imageCheker.js";
import { errorMessage, errorMessageFormat } from "../utils/error.js";

const products = methodErrorHandler(
    async (req, res, next) => {
        const products = await Product.find();
        res.json(products);
    }
);

const product = methodErrorHandler(
    async (req, res, next) => {
        const id = req.params.id;
        if (!Types.ObjectId.isValid(id))
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, 'Invalid product id'))

        const product = await Product.findOne({ _id: id }).lean().select('-_id -isFeatured -createdAt -updatedAt -__v')
        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { ...product } })
    }
);

const create = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = ProductCreateValidationSchema.validate(req.body)
        const err = (message) => next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, message))

        if (error || !req.body)
            return err(errorMessageFormat(error) || 'Image is required.');

        const cloudinaryResponse = await imageCheck(req.file, err);
        const product = await Product.create({
            ...value,
            image: cloudinaryResponse.secure_url || '',
        });
        res.status(201).json({
            status: HTTP_STATUS.SUCCESS,
            data: { name: product.name, category: product.category, description: product.description, price: product.price, image: product.image },
            message: 'Product added successfully.'
        },);
    }
);

const del = methodErrorHandler(
    async (req, res, next) => {

    }
);

const Products = {
    products,
    product,
    create,
    del
};

export default Products;