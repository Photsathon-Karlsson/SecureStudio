// This file defines middleware functions for the Express server.
function logger(req, res, next) {
    console.log(`[${req.method}] ${req.url}`); // print method and URL
    next(); // continue to next middleware or route
}
export { logger };
//# sourceMappingURL=middleware.js.map