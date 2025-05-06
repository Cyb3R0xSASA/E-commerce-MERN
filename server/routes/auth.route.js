import { Router } from 'express';
import {
    signup,
    verifyAccount,
    resendOtp,
    signin,
    forgetPassword,
    resetPassword,
    changePassword,
    createAccessToken,
    logout,
} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/verify-account', verifyAccount);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/signin', signin);
authRouter.post('/forget-password', forgetPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/change-password', changePassword);
authRouter.post('/create-access-token', createAccessToken);
authRouter.post('/logout', logout);

export default authRouter;