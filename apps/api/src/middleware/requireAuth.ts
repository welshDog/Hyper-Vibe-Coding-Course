import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised - no token' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as { userId: string }
    ;(req as any).userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorised - invalid token' })
  }
}
