// connects to DynamoDB & sets the table name (jwt) 

import { DynamoDBClient } from '@aws-sdk/client-dynamodb' 
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb' 

// Read AWS credentials from environment variables (read keys from .env)
const accessKey: string = process.env.ACCESS_KEY || ''
const secret: string = process.env.SECRET_ACCESS_KEY || ''

// Create a low-level DynamoDB client
const client: DynamoDBClient = new DynamoDBClient({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: accessKey,        // from .env
    secretAccessKey: secret        // from .env
  }
})

// Create a DocumentClient 
const db: DynamoDBDocumentClient = DynamoDBDocumentClient.from(client)

// Export table name 
const tableName = 'jwt'

export { db, tableName }
