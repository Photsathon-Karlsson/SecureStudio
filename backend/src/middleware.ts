// This file defines middleware functions for the Express server.

import type { Request, Response, NextFunction } from 'express'

function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.url}`) // print method and URL
  next() // continue to next middleware or route
}

export { logger } 
