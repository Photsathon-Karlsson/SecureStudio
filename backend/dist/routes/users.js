// Handle API for users
// GET /api/users → Get list of users (username + userId)
// DELETE /api/users/:userId → Delete a user (need JWT and correct permission)
import express from 'express'; // express router
import { QueryCommand, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb'; // read & delete
import { db, tableName } from '../data/dynamoDb.js'; // DynamoDB client/table
import jwt from 'jsonwebtoken'; // verify JWT
const router = express.Router(); // make router
// GET /api/users -> list usernames + userId
router.get('/', async (req, res) => {
    try {
        // build a query to fetch all users under pk = 'USER'
        const cmd = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk', // query by partition key
            ExpressionAttributeValues: { ':pk': 'USER' },
            ProjectionExpression: 'sk, username' // fetch only needed fields
        });
        const out = await db.send(cmd); // run the query
        // if no items, return empty list (not an error)
        const items = (out.Items ?? []);
        // map DB items -> { username, userId } for frontend
        const result = items.map((u) => ({
            username: u.username, // keep the username
            userId: u.sk.substring(5) // take id from "USER#<id>"
        }));
        return res.send(result); // send list back as JSON
    }
    catch (err) {
        // unexpected error -> 500
        console.log('users GET error:', err instanceof Error ? err.message : String(err));
        return res.status(500).send();
    }
});
// Function : validate JWT from Authorization header
function validateJwt(authHeader) {
    // header format: "Bearer <token>"
    if (!authHeader)
        return null; // no header
    const maybeToken = authHeader.split(' ')[1]?.trim(); // get token part
    if (!maybeToken)
        return null; // no token
    try {
        // verify token using the same secret as when signing
        const decoded = jwt.verify(maybeToken, process.env.JWT_SECRET || '');
        // basic payload check
        if (typeof decoded?.userId !== 'string')
            return null;
        return { userId: decoded.userId }; // return payload
    }
    catch {
        return null; // invalid or expired token
    }
}
// DELETE /api/users/:userId -> delete only yourself (needs JWT)
router.delete('/:userId', async (req, res) => {
    try {
        // read target user id from URL params
        const userIdToDelete = req.params.userId;
        // validate JWT from Authorization header
        const payload = validateJwt(req.headers['authorization']);
        if (!payload) {
            return res.sendStatus(401); // no/invalid token
        }
        // allow only self-delete (token userId must match URL userId)
        if (payload.userId !== userIdToDelete) {
            return res.sendStatus(401); // not allowed
        }
        // build delete command for DynamoDB
        const cmd = new DeleteCommand({
            TableName: tableName,
            Key: {
                pk: 'USER',
                sk: 'USER#' + userIdToDelete
            },
            ReturnValues: 'ALL_OLD' // return deleted item if found
        });
        // try delete & respond
        const out = await db.send(cmd);
        if (out.Attributes) {
            return res.sendStatus(204); // deleted successfully
        }
        else {
            return res.sendStatus(404); // user not found
        }
    }
    catch (err) {
        console.log('users DELETE error:', err instanceof Error ? err.message : String(err));
        return res.sendStatus(500);
    }
});
// GET /api/users/me -> get my own profile using JWT
router.get('/me', async (req, res) => {
    // read token from Authorization header
    const payload = validateJwt(req.headers['authorization']);
    if (!payload) {
        return res.sendStatus(401); // missing or invalid token
    }
    // build a get command to fetch this user by id
    const cmd = new GetCommand({
        TableName: tableName,
        Key: {
            pk: 'USER',
            sk: 'USER#' + payload.userId
        },
        ProjectionExpression: 'sk, username'
    });
    // run the get command
    const out = await db.send(cmd);
    // if not found, return 404
    if (!out.Item) {
        return res.sendStatus(404);
    }
    // map item to response
    const item = out.Item;
    const userId = item.sk.substring(5); // take id from "USER#<id>"
    // send profile back
    return res.send({ id: userId, username: item.username });
});
export default router;
//# sourceMappingURL=users.js.map