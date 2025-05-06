import Joi from 'joi';

const password = {
    pass1: Joi.string().min(8).max(256)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')).required(),
    pass2: Joi.string().valid(Joi.ref('pass1')).required(),
};

const email = {
    email: Joi.string().email().lowercase().required()
};

const otp = {
    otp: Joi.string().pattern(/^\d{6}$/).required(),
};

const UserSignupValidationSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    ...email,
    ...password,
});

const UserLoginValidationSchema = Joi.object({
    ...email,
    password: Joi.string().min(8).max(128).required(),
});

const UserVerifyOTPSchema = Joi.object({ ...otp });

const UserResendOtpSchema = Joi.object({ ...email });

const UserResetPasswordValidationSchema = Joi.object({ ...otp, ...password });

export {
    UserSignupValidationSchema,
    UserLoginValidationSchema,
    UserVerifyOTPSchema,
    UserResendOtpSchema,
    UserResetPasswordValidationSchema,
}