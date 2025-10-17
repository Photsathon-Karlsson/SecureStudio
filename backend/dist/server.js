// This file starts the server, enables CORS, connects routers for auth and users.
// It replaces the old in-memory API & connects to DynamoDB.
import 'dotenv/config'; // load variables from .env
import express from 'express';
import cors from 'cors';
// import middleware (for showing request logs)
import { logger } from './middleware.js';
// import routers for each API group
import registerRouter from './routes/register.js'; // POST /api/register
import loginRouter from './routes/login.js'; // POST /api/login
import usersRouter from './routes/users.js'; // GET or DELETE /api/users
// create express app & read port number
const app = express();
const PORT = Number(process.env.PORT) || 1333; // use value from .env or 1333
// middleware for reading JSON in requests
app.use(express.json());
// enable CORS so frontend can call the API
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://localhost:5173',
    ], // allowed websites
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allowed request headers
    credentials: true, // allow cookies if needed
}));
// log all incoming requests
app.use('/', logger);
// connect route files
app.use('/api/users', usersRouter); // handle users
app.use('/api/register', registerRouter); // handle register
app.use('/api/login', loginRouter); // handle login
// small test route
app.get('/api/ping', (req, res) => {
    res.send({ message: 'Pong' }); // send back message to test the server
});
// start the server & listen on selected port
app.listen(PORT, (error) => {
    if (error) {
        console.log('Server could not start!', error.message);
    }
    else {
        console.log(`Server running on http://localhost:${PORT}`);
    }
});
//# sourceMappingURL=server.js.map