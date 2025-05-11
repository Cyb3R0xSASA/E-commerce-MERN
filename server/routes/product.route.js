import { Router } from 'express';
import { adminRoute, protectRoute } from '../middlewares/auth.middleware.js';
import Products from '../controllers/product.controller.js';
const router = Router();
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
    .get(protectRoute, adminRoute, Products.products)
    .post(protectRoute, adminRoute, upload.single('image'), Products.create);

router.get('/featured', Products.featured);

router.route('/categories')
    .get(Products.categories)
    .post(protectRoute, adminRoute, Products.createCategory);

router.get('/categories/:id', Products.category)

router.route('/:id')
    .get(Products.product)
    .post(protectRoute, adminRoute, Products.del);


export default router;