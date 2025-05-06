const errorResponse = (error, _, res, __) => {
    return res.status(error.statusCode)
        .json({
            status: error.statusCode,
            data: error.data,
            message: error.message,
        });
};

const methodErrorHandler = (asyncFn) =>
    (req, res, next) =>
        asyncFn(req, res, next).catch((err) => next(err));

export {
    errorResponse,
    methodErrorHandler,
}