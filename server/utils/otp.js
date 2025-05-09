import { renderFile } from 'ejs';
import path from 'path';
import { redis } from '../config/redis.config.js';
import { genSaltSync, hashSync } from 'bcrypt';
import { HTTP_STATUS, OTP_CONF, SMTP } from '../config/constants.js';
import { errorMessage } from './error.js';
import { fileURLToPath } from 'url';
import { transporter } from '../services/email/smtp.js';

const randomOTPGenerator = (length = 6) => {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    return otp;
};

export const otpGenerator = async (user, next, otpType = 'verify') => {
    const limitKey = `otp_limit:${user.id}`;
    const otpKey = `otp_key:${user.id}`;
    const attempts = await redis.get(limitKey);
    const subject = otpType === 'verify' ? 'Verify Your Email Address' : 'Reset Your Password';

    if (attempts && Number(attempts) >= OTP_CONF.MAX_OTP_PER_DAY)
        return next(errorMessage.create(HTTP_STATUS.FAIL, 429, { message: 'You reached for max requests of OTP for today' }));

    const otp = randomOTPGenerator();
    console.log(otp)
    await redis.set(otpKey, hashSync(otp, genSaltSync(10)), 'EX', OTP_CONF.OTP_TTL_SECONDS);
    await redis.incr(limitKey);
    console.log('first');
    if (!attempts)
        await redis.expire(limitKey, OTP_CONF.OTP_LIMIT_TTL);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const html = await renderFile(
        path.join(__dirname, '../services/email/email.ejs'),
        {
            subject,
            userName: user.name,
            otp,
            verifyLink: 'https://linkedin.com/in/mohmedmostafayoussef',
        }
    );

    const mailOptions = {
        from: SMTP.USER,
        to: user.email,
        subject,
        html,
        attachments: [
            {
                filename: 'trainix.png',
                path: path.join(__dirname, '../services/email/trainix.png'),
                cid: 'trainixLogo'
            },
        ],
    };

    await transporter.sendMail(mailOptions)
}
