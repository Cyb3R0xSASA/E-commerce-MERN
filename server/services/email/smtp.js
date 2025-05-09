import { createTransport } from 'nodemailer';
import { SMTP } from '../../config/constants.js';

export const transporter = createTransport({
    host: SMTP.HOST,
    port: SMTP.PORT,
    secure: false,
    auth: {
        user: SMTP.USER,
        pass: SMTP.PASSWORD
    },
});

