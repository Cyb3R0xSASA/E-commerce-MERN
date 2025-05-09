import 'dotenv/config';

const SERVER = {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    SERVER: process.env.SERVER,
};

const DB = {
    DATABASE_URI: process.env.DATABASE_URI,
    REDIS_URL: process.env.REDIS_URL
};

const JWT = {
    JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};

const HTTP_STATUS = {
    SUCCESS: 'success',
    FAIL: 'fail',
};

const SMTP = {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    USER: process.env.SMTP_USER,
    PASSWORD: process.env.SMTP_PASSWORD,
};

const OTP_CONF = {
    MAX_OTP_PER_DAY: 5,
    OTP_TTL_SECONDS: 300,
    OTP_LIMIT_TTL: 86400,
};

const NODE_ENV = process.env.NODE_ENV;

export {
    SERVER,
    DB,
    JWT,
    HTTP_STATUS,
    SMTP,
    OTP_CONF,
    NODE_ENV,
};