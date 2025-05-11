import { HTTP_STATUS } from "../config/constants.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { Product } from "../models/product.model.js";
import { errorMessage } from "../utils/error.js";
import { checkId } from "./product.controller.js";

const cart = methodErrorHandler(
    async (req, res, next) => {
        const id = req.body.id;
        if (!req.body) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));
        checkId(id, next);

        const product = await Product.findById(id);
        if (!product) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));

        const user = req.user;
        const existItem = user.cartItems.find(item => item.id === id);

        if (existItem)
            existItem.quantity += 1;
        else
            user.cartItems.push(id);
        await user.save();
        res.json(user);
    }
);

const add = methodErrorHandler(
    async (req, res, next) => {
        const id = req.body.id;
        if (!req.body) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));
        checkId(id, next);

    }
);

const remove = methodErrorHandler(
    async (req, res, next) => {

    }
);

const update = methodErrorHandler(
    async (req, res, next) => {

    }
);

const Cart = {
    cart,
    add,
    remove,
    update
};

export default Cart