import { Router } from 'express';
import { adminRoute, protectRoute } from '../middlewares/auth.middleware.js';
import { products } from '../controllers/product.controller.js';
const router = Router();

router.get('/', protectRoute, adminRoute, products)

export default router;