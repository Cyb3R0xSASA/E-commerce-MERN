import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import Coupon from "../controllers/coupon.controller.js";
const router = Router();

router.get('/', protectRoute, Coupon.coupon);
router.get('/validate', protectRoute, Coupon.validate);

export default router;