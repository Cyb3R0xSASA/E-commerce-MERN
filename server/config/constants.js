import 'dotenv/config';

const SERVER = {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    SERVER: process.env.SERVER,
};

const DATABASE_URI = process.env.DATABASE_URI;

export {
    SERVER,
    DATABASE_URI
}