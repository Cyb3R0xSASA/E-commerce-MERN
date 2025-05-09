import Redis from "ioredis";
import { DB } from "./constants.js";

export const redis = new Redis(DB.REDIS_URL);