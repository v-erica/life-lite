import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserByCredentials } from "#db/queries/users";
import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";

router.post(
  "/register",
  requireBody(["email", "password", "first_name"]),
  async (req, res) => {
    const { email, password, first_name, birthday, username, photo_url } =
      req.body;

    if (!email?.trim() || !password?.trim() || !first_name?.trim()) {
      return res
        .status(400)
        .json({ error: "Email, password, and first name are required." });
    }

    try {
      const user = await createUser(
        email,
        password,
        first_name,
        birthday,
        username,
        photo_url,
      );

      const token = createToken({ sub: user.id });

      return res.status(201).json({ token });
    } catch (err) {
      if (err.code === "23505") {
        if (err.constraint?.includes("email")) {
          return res.status(409).json({ error: "Email already in use." });
        }
        if (err.constraint?.includes("username")) {
          return res.status(409).json({ error: "Username already in use." });
        }
        return res.status(409).json({ error: "Duplicate value not allowed." });
      }
      console.error("Registration error:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

router.post("/login", requireBody(["email", "password"]), async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await getUserByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = createToken({ sub: user.id });

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});
