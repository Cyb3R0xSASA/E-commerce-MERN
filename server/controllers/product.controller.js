import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { Product } from '../models/product.model.js';

const products = methodErrorHandler(
    async (req, res, next) => {
        const products = await Product.find();
        res.json(products);
    }
);


export {
    products
}