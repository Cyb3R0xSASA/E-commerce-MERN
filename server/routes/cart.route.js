import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import Cart from "../controllers/cart.controllers.js";

const router = Router();

router.route('/')
    .get(protectRoute, Cart.cart)
    .post(protectRoute, Cart.add)
    .delete(protectRoute, Cart.remove)
    .put(protectRoute, Cart.update);

export default router;