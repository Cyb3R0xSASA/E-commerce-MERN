import { sign } from "jsonwebtoken"
import { JWT } from "../config/constants"

export const generateJWT = (userId) => {
    const access = sign({ userId }, JWT.JWT_SECRET_KEY, { expiresIn: '15m' });
    const refresh = sign({ userId }, JWT.JWT_REFRESH_KEY, { expiresIn: '7d' });
    return { access, refresh };
};