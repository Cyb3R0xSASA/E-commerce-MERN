import { HTTP_STATUS } from "../config/constants.js";
import { redis } from "../config/redis.config.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { UserLoginValidationSchema, UserSignupValidationSchema } from "../middlewares/validation/user.validation.js";
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
        const { access, refresh } = generateJWT(user.id)
        await storeJWT(user.id, refresh);
        setCookies(res, access, refresh);
        res.status(201).json({ status: HTTP_STATUS.SUCCESS, data: { name: user.name, email: user.email, role: user.role }, message: "User created successfully" });
    }
);

const verifyAccount = methodErrorHandler(
    
);

const resendOtp = async (req, res) => {
};

const signin = async (req, res) => {
};

const forgetPassword = async (req, res) => {
};

const resetPassword = async (req, res) => {
};

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