import express from 'express';
import { SERVER } from './config/constants.js';

const app = express();

app.get('/', (req, res) => {
    res.send('Server running successfully 🦾.')
})


app.listen(SERVER.PORT, SERVER.HOST, () => {
    console.log(`Server running on ${SERVER.SERVER}`);
})