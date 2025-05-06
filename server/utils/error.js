import { HTTP_STATUS } from "../config/constants";

class ErrorMessage extends Error {
    constructor() {
        super();
    };

    create(statusText = HTTP_STATUS.FAIL, statusCode = 400, data = null, message = undefined) {
        this.statusText = statusText;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        return this;
    };
};

const errorMessageFormat = (error) => {
    return error.details[0].message.replace('"', '').replace('"', '');
};

const errorMessage = new ErrorMessage();

export {
    errorMessage,
    errorMessageFormat,
}