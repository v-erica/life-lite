/**
 * Middleware guard that blocks requests where no authenticated user was found.
 * Must be used after getUserFromToken in the middleware chain.
 * Returns a 401 if req.user is not set.
 */
export default async function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  next();
}
