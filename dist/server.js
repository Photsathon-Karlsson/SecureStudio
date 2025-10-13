import express from "express"; // import Express web framework
import jwt from "jsonwebtoken"; // import JWT library
import cors from "cors"; // allow browser apps to call our API
const app = express(); // create express app
const JWT_SECRET = process.env.SECRET_ACCESS_KEY || "dev-secret"; // secret key for token
app.use(express.json()); // allow app to read JSON body
// CORS: allow frontend (Live Server) to call our API 
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"], // allow these origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // headers we accept
}));
// store users in memory (reset on server restart)
const users = [];
// simple id counter
let nextId = 1;
// middleware to check token
function auth(req, res, next) {
    const authHeader = req.headers.authorization; // get authorization header
    if (!authHeader)
        return res.status(401).json({ error: "missing authorization header" }); // no header
    // format should be: "Bearer <token>"
    const token = authHeader.split(" ")[1]?.trim(); // get token after "Bearer"
    if (!token)
        return res.status(401).json({ error: "missing token" }); // no token found
    // try to verify token
    // use try–catch because `jwt.verify()` throws error if token is bad or expired
    try {
        const decoded = jwt.verify(token, JWT_SECRET) // check if token is valid
        ;
        req.user = decoded; // save user info in request
        next(); // continue to next
    }
    catch (err) {
        return res.status(401).json({ error: "invalid or expired token" }); // stop here if token is not valid
    }
}
// create a register endpoint
app.post("/api/register", (req, res) => {
    const { username, password } = req.body; // get username & password from request
    // basic validation
    if (!username || !password)
        return res.status(400).json({ error: "username and password are required" });
    // avoid duplicate
    if (users.some(u => u.username === username))
        return res.status(409).json({ error: "username already exists" });
    const newUser = { id: nextId++, username, password }; // make new user
    users.push(newUser); // save user in array
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const defaultExpiration = now + 60 * 60; // token valid for 1 hour
    // create JWT 
    const token = jwt.sign({ sub: newUser.id, username: newUser.username, exp: defaultExpiration }, JWT_SECRET);
    // send token back
    return res.status(201).json({ id: newUser.id, username: newUser.username, token });
});
// create a signin endpoint
app.post("/api/signin", (req, res) => {
    const { username, password } = req.body; // get login data
    // check empty input
    if (!username || !password)
        return res.status(400).json({ error: "username and password are required" });
    // find user match
    const user = users.find(u => u.username === username && u.password === password);
    // wrong login info
    if (!user)
        return res.status(401).json({ error: "invalid username or password" });
    // create a token for the logged in user
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const defaultExpiration = now + 60 * 15; // token valid for 15 mins
    // create JWT with manual exp claim
    const token = jwt.sign({ sub: user.id, username: user.username, exp: defaultExpiration }, JWT_SECRET);
    // send token back
    return res.json({ id: user.id, username: user.username, token });
});
// protected: list all usernames
app.get("/api/users", auth, (req, res) => {
    const names = users.map(u => u.username); // pick only usernames
    return res.json({ users: names }); // send list as JSON
});
// get my profile (return my own profile)
app.get("/api/users/me", auth, (req, res) => {
    const decoded = req.user; // get data from middleware
    if (!decoded?.sub)
        return res.status(401).json({ error: "bad token" }); // token missing/bad
    const user = users.find(u => u.id === decoded.sub); // find user by id from token
    if (!user)
        return res.status(404).json({ error: "user not found" }); // not found
    return res.json({ id: user.id, username: user.username }); // send profile
});
app.get("/", (req, res) => {
    res.send("Hello SecureStudio!"); // send back simple text
});
app.listen(1444, () => {
    console.log("Server running on http://localhost:1444"); // show message in terminal
});
//# sourceMappingURL=server.js.map