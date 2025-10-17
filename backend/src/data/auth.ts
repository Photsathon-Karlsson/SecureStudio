// Create/Sign JWT tokens for users

import jwt from 'jsonwebtoken' 
const jwtSecret: string = process.env.JWT_SECRET || '' // read secret from .env

// createToken(userId) -> returns a signed JWT
function createToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000) // current time in seconds
  const exp = now + 15 * 60                 // expire in 15 minutes
  return jwt.sign({ userId, exp }, jwtSecret) // sign a JWT with payload & secret
}

export { createToken } 
