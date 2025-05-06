import express, { json } from 'express';
import { SERVER } from './config/constants.js';
import authRouter from './routes/auth.route.js';
import { ConnectDB } from './config/db.config.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { routesErrorHandler } from './middlewares/errors/route.error.js';
import { errorResponse } from './middlewares/errors/method.error.js';

const app = express();
app.use(morgan('dev'));
app.use(json());
app.use(cookieParser());

app.use('/api/auth/', authRouter);
app.use(errorResponse);
app.use(routesErrorHandler);

app.listen(SERVER.PORT, SERVER.HOST, () => {
    console.log(`Server running on ${SERVER.SERVER}`);
    ConnectDB();
});