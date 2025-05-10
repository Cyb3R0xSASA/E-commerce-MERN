import { Router } from 'express';
import { adminRoute, protectRoute } from '../middlewares/auth.middleware.js';
const router = Router();

router.get('/', protectRoute, adminRoute, (req, res, next) => {
    res.json(req.user)
})

export default router;