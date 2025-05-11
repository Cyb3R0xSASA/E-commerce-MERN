import { compareSync, hashSync } from "bcrypt";
import { HTTP_STATUS } from "../config/constants.js";
import { redis } from "../config/redis.config.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { UserLoginValidationSchema, UserResendOtpSchema, UserResetPasswordValidationSchema, UserSignupValidationSchema, UserVerifyOTPSchema } from "../middlewares/validation/user.validation.js";
import { User } from "../models/user.model.js";
import { errorMessage } from "../utils/error.js";
import { generateJWT, setCookies, storeJWT, verifyJWT } from "../utils/jwt.js";
import { deleteOtp, otpGenerator } from "../utils/otp.js";

const signup = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = UserSignupValidationSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Registration failed. Please try again.' }));

        if (error || !req.body) return err();
        if (await User.findOne({ email: value.email })) return err();

        const user = await User.create({ ...value });

        await otpGenerator(user, next);
        const { access, refresh } = generateJWT(user.id);
        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);
        res.status(201).json({ status: HTTP_STATUS.SUCCESS, data: { name: user.name, email: user.email, role: user.role }, tokens: { accessToken: access, refreshToken: refresh }, message: "User created successfully" });
    }
);

const verifyAccount = methodErrorHandler(
    async (req, res, next) => {
        const { error, value: { otp } } = UserVerifyOTPSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Verify failed. Please try again.' }));

        if (error || !req.body) return err();
        const { userId } = verifyJWT.access(req.cookies.accessToken);
        const hashedOtp = await redis.get(`otp_key:${userId}`);

        if (!hashedOtp) return err();
        if (!compareSync(otp, hashedOtp)) return err();

        const user = await User.findById(userId);
        user.isActivate = true;
        await user.save();
        await deleteOtp();

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { message: 'Verified successfully' } })
    }
);

const resendOtp = methodErrorHandler(
    async (req, res, next) => {
        const { error, value: { email } } = UserResendOtpSchema.validate(req.body)
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Resend otp failed. Please try again.' }));

        if (error || !req.body) return err();
        const user = await User.findOne({ email });
        if (!user || user.isActive === true) return err();

        await otpGenerator(user, next);
        const { access, refresh } = generateJWT(user.id);

        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { accessToken: access, refreshToken: refresh } });
    }
)

const signin = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = UserLoginValidationSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Password or email not correct' }));

        if (error || !req.body) return err();
        let user = await User.findOne({ email: value.email });
        if (!user || user.isActivate === false) return err();

        const isMatch = await user.comparePassword(value.password);
        if (!isMatch) return err();

        const { access, refresh } = generateJWT(user.id)
        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);
        user = await User.findOne({ email: value.email }).select('-isActivate -createdAt -updatedAt -__v');
        return res.status(200).json({
            status: HTTP_STATUS.SUCCESS,
            data: { ...user._doc},
            tokens: { accessToken: access, refreshToken: refresh }
        });
    }
);

const forgetPassword = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = UserResendOtpSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Resend otp failed. Please retry again.' }));

        if (error || !req.body) return err();
        const user = await User.findOne({ email: value.email });
        if (!user || user.isActivate === false) return err();

        await otpGenerator(user, next, 'reset');
        const { access, refresh } = generateJWT(user.id);
        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);
        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { accessToken: access, refreshToken: refresh } });
    }
);

const resetPassword = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = UserResetPasswordValidationSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Reset password. Please retry again.' }));

        console.log(error)
        if (error || !req.body) return err();

        const { userId } = verifyJWT.access(req.cookies.accessToken);
        const user = await User.findById(userId);
        if (!user || user.isActivate === false) return err();

        const hashedOtp = await redis.get(`otp_key:${userId}`);
        if (!hashedOtp) return err();
        if (!compareSync(value.otp, hashedOtp)) return err();

        user.password = value.password;
        await user.save();
        await deleteOtp();

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null })
    }
);

const createAccessToken = methodErrorHandler(
    async (req, res, next) => {
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 401, null, 'No refresh token provided.'));
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return err();

        const { userId } = verifyJWT.refresh(refreshToken);
        const storedToken = await redis.get(`refresh_token:${userId}`);

        if (refreshToken !== storedToken)
            return err();

        const { access } = generateJWT(userId);
        setCookies(res, access);

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { access } });
    }
);

const logout = methodErrorHandler(
    async (req, res, next) => {
        const refresh = req.cookies.refreshToken;
        if (!refresh)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));
        await redis.del(`refresh_token:${verifyJWT.refresh(refresh).userId}`);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null, })
    }
);

export {
    signup,
    verifyAccount,
    resendOtp,
    signin,
    forgetPassword,
    resetPassword,
    createAccessToken,
    logout,
}

// TODO: signup ✅
// TODO: verifyAccount ✅
// TODO: resendOtp ✅
// TODO: signin ✅
// TODO: forgetPassword ✅
// TODO: resetPassword ✅
// TODO: createAccessToken 
// TODO: logout ✅