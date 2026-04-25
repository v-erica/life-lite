import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

/**
 * Signs a JWT payload and returns a signed token string.
 * Throws if JWT_SECRET is not set in the environment.
 */
export function createToken(payload) {
  if (!SECRET) throw new Error("Missing JWT_SECRET");

  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

/**
 * Verifies a JWT string and returns its decoded payload.
 * Throws if the token is invalid, expired, or JWT_SECRET is missing.
 */
export function verifyToken(token) {
  // WHY (Functionality): Guard against a missing JWT_SECRET the same way
  // createToken does. Without this check, jwt.verify would throw a confusing
  // library-level error instead of a clear, developer-friendly message.
  if (!SECRET) throw new Error("Missing JWT_SECRET");

  return jwt.verify(token, SECRET);
}
