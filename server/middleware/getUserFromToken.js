import { getUserById } from "#db/queries/users";
import { verifyToken } from "#utils/jwt";

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
    console.error(e);

    return res.status(401).json({ error: "Invalid token." });
  }
}
