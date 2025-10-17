// Register new user & return JWT
    // the server will:
    // 1. Check if the data is correct
    // 2. Create a new user ID
    // 3. Save the data into DynamoDB
    // 4. Send back a JWT token

import express from 'express'             
import type { Router, Request, Response } from 'express' 
import { PutCommand } from '@aws-sdk/lib-dynamodb'       // to write data to DynamoDB
import { db, tableName } from '../data/dynamoDb.js'      // import DynamoDB setup
import { createToken } from '../data/auth.js'            // import function to make JWT
import type { JwtResponse, UserBody } from '../data/types.js' // import types
import { randomUUID } from 'node:crypto'               // create unique user id

const router: Router = express.Router()                // make a router object

// POST /api/register
router.post('/', async (req: Request<{}, JwtResponse, UserBody>, res: Response<JwtResponse>) => {
  // read data from body
  const body: UserBody = req.body
  console.log('body', body) 
  // create a new random id for user
  const newId = randomUUID() 
  console.log('new user id:', newId) 

  // prepare the command to save new user into DynamoDB
  const command = new PutCommand({
    TableName: tableName, // name of DynamoDB table
    Item: {
      ...body,               // spread username & password from client
      accessLevel: 'user',   // set default role
      pk: 'USER',            // partition key always USER
      sk: 'USER#' + newId    // sort key = USER# + userId
    }
  })
    try {
    // send command to DynamoDB
    const result = await db.send(command)
    console.log('put result:', result) 

    // create a JWT token for this new user
    const token: string = createToken(newId) // sign token with userId

    // send success response with token
    return res.send({ success: true, token })
  } catch (error) {
    // if anything fails, log error and send 500
    console.log('register error:', (error as any)?.message)
    return res.status(500).send({ success: false })
  }
}) 

export default router

