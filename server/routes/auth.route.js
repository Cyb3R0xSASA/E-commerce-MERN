import { Router } from 'express';
import {
    signup,
    verifyAccount,
    resendOtp,
    signin,
    forgetPassword,
    resetPassword,
    createAccessToken,
    logout,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/verify-account', verifyAccount);
router.post('/resend-otp', resendOtp);
router.post('/signin', signin);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', createAccessToken);
router.post('/logout', logout);

export default router;