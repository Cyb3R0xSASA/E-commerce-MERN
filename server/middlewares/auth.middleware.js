import { HTTP_STATUS } from "../config/constants.js";
import { User } from "../models/user.model.js";
import { errorMessage } from "../utils/error.js";
import { verifyJWT } from "../utils/jwt.js";
import { methodErrorHandler } from "./errors/method.error.js";

const protectRoute = methodErrorHandler(
    async (req, _, next) => {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 401, 'Unauthorized - No access token provided'));

        const { userId } = verifyJWT.access(accessToken);
        const user = await User.findById(userId).select('-password -isActivate -__v -updatedAt -createdAt');
        if (!user)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 401, 'Unauthorized - No access token provided'));
        
        req.user = user;
        next();
    }
);

const adminRoute = methodErrorHandler(
    async (req, _, next) => {
        if (!req.user || req.user.role !== 'admin') 
            return next(errorMessage.create(HTTP_STATUS.FAIL, 401, 'Unauthorized - Admin only'));

        next();
    }
);

export {
    protectRoute,
    adminRoute
}