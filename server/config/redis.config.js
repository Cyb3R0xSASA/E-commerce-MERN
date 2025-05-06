import Redis from "ioredis";
import { DB } from "./constants.js";

const redis = new Redis(DB.REDIS_URL);

export const storeRefreshToken = async (id, token) => {
    await redis.set(`refresh_token_${id}`, token);
}