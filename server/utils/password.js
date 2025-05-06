import { compareSync, genSaltSync, hashSync } from 'bcrypt';

const hashPassword =  (pass) => {
    try {
        return hashSync(pass, genSaltSync(10));
    } catch (error) {
        next(error);
    }
};

const comparePassword = (password, hashedPassword) => {
    return compareSync(password, hashedPassword);
};

export const Password = {
    hashPassword,
    comparePassword,
}