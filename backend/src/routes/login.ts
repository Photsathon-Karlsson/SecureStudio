// Login user & return JWT if password is correct

import express from 'express'
import type { Router, Request, Response } from 'express'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, tableName } from '../data/dynamoDb.js'
import { createToken } from '../data/auth.js'
import type { JwtResponse, UserBody, UserItem } from '../data/types.js' 

const router: Router = express.Router() // create router for /api/login

// POST /api/login
router.post(
  '/',
  async (
    req: Request<unknown, JwtResponse, UserBody>,   // request body shape from types.ts
    res: Response<JwtResponse>
  ) => {
    // basic read + normalize input
    const username = req.body?.username?.trim()     // trim spaces
    const password = req.body?.password ?? ''

    // simple validate
    if (!username || !password) {
      return res.status(400).send({ success: false }) // missing input
    }

    try {
      // build a query for this username under pk USER
      const cmd = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk',           // query by partition key
        ExpressionAttributeValues: {
          ':pk': 'USER',
          ':uname': username
        },
        ExpressionAttributeNames: { '#u': 'username' },
        FilterExpression: '#u = :uname', // filter by exact username (show only match results)
        ProjectionExpression: 'pk, sk, username, password, accessLevel',
        Limit: 1
      })

      const out = await db.send(cmd)
      const users = (out.Items ?? []) as UserItem[]
      const user = users[0] // first match

      // return 401 on not found 
      if (!user) {
        return res.status(401).send({ success: false })
      }

      // compare password 
      const isMatch = user.password === password
      if (!isMatch) {
        return res.status(401).send({ success: false })
      }

      // extract id from sk "USER#<id>"
      const userId = user.sk.substring(5) // take id part

      // create JWT for this user
      const token = createToken(userId)

      return res.send({ success: true, token })
    } catch (err) {
      console.log('login.ts error:', err instanceof Error ? err.message : String(err))
      return res.status(500).send({ success: false })
    }
  }
)

export default router
