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

export {
    SERVER,
    DB,
    JWT,
    HTTP_STATUS,
};