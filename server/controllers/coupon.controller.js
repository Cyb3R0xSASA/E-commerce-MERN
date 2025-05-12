import { HTTP_STATUS } from "../config/constants.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js"
import { ValidationCouponSchema } from "../middlewares/validation/extra.validation.js";
import Coupon from '../models/coupon.model.js'
import { errorMessage, errorMessageFormat } from "../utils/error.js";

const coupon = methodErrorHandler(
    async (req, res, next) => {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        if (!coupon) return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null));
        res.status(200).json(coupon);
    }
);

const validate = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = ValidationCouponSchema.validate(req.body);
        const err = (message) => next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, message));
        if (error || !req.body)
            return err(errorMessageFormat(error || 'Enter code.'));

        const coupon = await Coupon.findOne({ code: value.code, userId: req.user.id, isActive: true });
        if (!coupon)
            return err('Coupon not found');

        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false;
            await coupon.save();
            return err('Coupon expire.')
        };

        res.status(200).json({
            status: HTTP_STATUS.SUCCESS,
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    }
)

const Coupons = {
    coupon,
    validate
}

export default Coupons