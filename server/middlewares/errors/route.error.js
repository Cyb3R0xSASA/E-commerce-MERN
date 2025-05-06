import { HTTP_STATUS } from "../../config/constants.js"

export const routesErrorHandler = (_, res, __) =>
    res.status(404).json({ status: HTTP_STATUS.FAIL, message: 'Endpoint not found' })
