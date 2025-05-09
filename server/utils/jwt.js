import { JWT, NODE_ENV } from "../config/constants.js";
import { redis } from "../config/redis.config.js";
import pkg from "jsonwebtoken";
const { verify, sign } = pkg

const generateJWT = (userId) => {
    const access = sign({ userId }, JWT.JWT_SECRET_KEY, { expiresIn: '15m' });
    const refresh = sign({ userId }, JWT.JWT_REFRESH_KEY, { expiresIn: '15d' });
    return { access, refresh };
};

const verifyJWT = {
    access: (token) => verify(token, JWT.JWT_SECRET_KEY),
    refresh: (token) => verify(token, JWT.JWT_REFRESH_KEY),
};

const storeJWT = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 15 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'pro',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'pro',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });
};

export {
    generateJWT,
    verifyJWT,
    storeJWT,
    setCookies,
}