import { compareSync, hashSync } from "bcrypt";
import { HTTP_STATUS } from "../config/constants.js";
import { redis } from "../config/redis.config.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { UserLoginValidationSchema, UserResendOtpSchema, UserResetPasswordValidationSchema, UserSignupValidationSchema, UserVerifyOTPSchema } from "../middlewares/validation/user.validation.js";
import { User } from "../models/user.model.js";
import { errorMessage } from "../utils/error.js";
import { generateJWT, setCookies, storeJWT, verifyJWT } from "../utils/jwt.js";
import { otpGenerator } from "../utils/otp.js";

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
        res.status(201).json({ status: HTTP_STATUS.SUCCESS, data: { name: user.name, email: user.email, role: user.role }, message: "User created successfully" });
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
        await redis.del(`otp_key:${userId}`);
        await redis.del(`otp_limit:${userId}`);

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

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null });
    }
)

const signin = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = UserLoginValidationSchema.validate(req.body);
        const err = () => next(errorMessage.create(HTTP_STATUS.FAIL, 400, { message: 'Password or email not correct' }));

        if (error || !req.body) return err();
        const user = await User.findOne({ email: value.email });
        if (!user || user.isActivate === false) return err();

        const isMatch = await user.comparePassword(value.password);
        if (!isMatch) return err();

        const { access, refresh } = generateJWT(user.id)
        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);
        return res.status(200).json({
            status: HTTP_STATUS.SUCCESS, data: {
                name: user.name,
                role: user.role,
            }
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
        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null });
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

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null })
    }
);

const changePassword = async (req, res) => {
};

const createAccessToken = async (req, res) => {
};

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
    changePassword,
    createAccessToken,
    logout,
}

// TODO: signup
// TODO: verifyAccount
// TODO: resendOtp
// TODO: signin
// TODO: forgetPassword
// TODO: resetPassword
// TODO: changePassword
// TODO: createAccessToken
// TODO: logout