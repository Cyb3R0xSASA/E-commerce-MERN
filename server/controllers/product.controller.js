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



const create = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = ProductCreateValidationSchema.validate(req.body)
        const err = (message) => next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, message))

        if (error || !req.body)
            return err(errorMessageFormat(error) || 'Image is required.');

        const cloudinaryResponse  = await imageCheck(req.file, err);
        const product = await Product.create({
            ...value,
            image: cloudinaryResponse.secure_url || '',
        });
        console.log(product)

        res.status(201).json(product)
    }
)

const Products = {
    products,
    create
};

export default Products;