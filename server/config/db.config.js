import { connect } from 'mongoose';
import { DATABASE_URI } from './constants.js';

export const ConnectDB = async () => {
    try {
        const conn = await connect(DATABASE_URI);
        console.log(`MongosDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB ${error}`);
        process.exit(1)
    }
}