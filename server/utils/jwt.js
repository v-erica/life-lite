import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function createToken(payload) {
  if (!SECRET) throw new Error("Missing JWT_SECRET");

  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}
