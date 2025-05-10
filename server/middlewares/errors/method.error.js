const errorResponse = (error, _, res, __) => {
    return res.status(error.statusCode || 400)
        .json({
            status: error.statusText,
            data: error.data,
            message: error.message,
            status_code: error.statusCode,
        });
};

const methodErrorHandler = (asyncFn) =>
    (req, res, next) =>
        asyncFn(req, res, next).catch((err) => next(err));

export {
    errorResponse,
    methodErrorHandler,
}