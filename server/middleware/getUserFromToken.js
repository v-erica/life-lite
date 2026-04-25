import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";

/**
 * Middleware that reads the Authorization header, verifies the JWT,
 * and attaches the matching user to req.user.
 * If no token is present or the token is invalid, it either skips
 * silently (missing token) or returns a 401 (bad token).
 */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];
  try {
    const { sub } = verifyToken(token);
    const user = await getUserById(sub);

    if (!user) return res.status(401).json({ error: "Invalid token." });

    req.user = user;

    return next();
  } catch (e) {
    console.error("Token verification failed:", e.message);

    return res.status(401).json({ error: "Invalid token." });
  }
}
