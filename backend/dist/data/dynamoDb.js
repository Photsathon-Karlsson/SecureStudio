// connects to DynamoDB & sets the table name (jwt) 
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
// Read AWS credentials from environment variables (read keys from .env)
const accessKey = process.env.ACCESS_KEY || '';
const secret = process.env.SECRET_ACCESS_KEY || '';
// Create a low-level DynamoDB client
const client = new DynamoDBClient({
    region: 'eu-north-1',
    credentials: {
        accessKeyId: accessKey, // from .env
        secretAccessKey: secret // from .env
    }
});
// Create a DocumentClient 
const db = DynamoDBDocumentClient.from(client);
// Export table name 
const tableName = 'jwt';
export { db, tableName };
//# sourceMappingURL=dynamoDb.js.map