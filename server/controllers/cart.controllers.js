import { HTTP_STATUS } from "../config/constants.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { UpdateQuantityOfCartSchema } from "../middlewares/validation/product.validation.js";
import { Product } from "../models/product.model.js";
import { errorMessage, errorMessageFormat } from "../utils/error.js";
import { checkId } from "./product.controller.js";

export const getCartProducts = async (cartItems) => {
    return await Promise.all(
        cartItems.map(async item => {
            const product = await Product.findById(item.id)
                .select('-isFeatured -createdAt -updatedAt -__v')
                .populate({ path: 'category', select: 'name description' })
                .lean();

            return {
                ...product,
                quantity: item.quantity,
            };
        })
    );
};

const cart = methodErrorHandler(
    async (req, res, next) => {
        const user = req.user;

        const products = await getCartProducts(user.cartItems);
        if (!products || products.length === 0)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, 'No products in cart.'));

        res.status(200).json(products)
    }
);

const add = methodErrorHandler(
    async (req, res, next) => {
        let id = req.body;
        if (!req.body) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));
        checkId(id, next);
        id = id.id;
        console.log(id)

        const product = await Product.findById(id);
        if (!product) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));

        const user = req.user;
        const existItem = user.cartItems.find(item => item.id === id);

        if (existItem)
            existItem.quantity += 1;
        else
            user.cartItems.push(id);
        await user.save();
        res.status(200).json(user.cartItems);
    }
);

const remove = methodErrorHandler(
    async (req, res, next) => {
        const id = req.body;

        const user = req.user;
        if (!id)
            user.cartItems = [];

        else {
            checkId(id, next);
            user.cartItems = user.cartItems.filter(item => item.id !== id);
        };

        await user.save();
        res.status(200).json(user.cartItems);
    }
);

const update = methodErrorHandler(
    async (req, res, next) => {
        const user = req.user;

        const { error, value } = UpdateQuantityOfCartSchema.validate(req.body);
        if (error)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, errorMessageFormat(error)));
        console.log(value.id)
        checkId(value.id, next);

        if (!await Product.findById(value.id))
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, 'Product not exist'));

        const existingItem = user.cartItems.find(item => item.id === value.id);
        if (!existingItem)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, 'Product not in the cart'));

        if (value.quantity === 0)
            user.cartItems = user.cartItems.filter(item => item.id !== value.id);

        existingItem.quantity = value.quantity;
        await user.save();
        const products = await getCartProducts(user.cartItems)
        res.status(200).json(products)
    }
);

const Cart = {
    cart,
    add,
    remove,
    update
};

export default Cart