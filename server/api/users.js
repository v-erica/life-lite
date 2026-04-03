import express from "express";
const router = express.Router();
export default router;

import { createUser } from "#db/queries/users";
import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";

router.post(
  "/register",
  requireBody(["email", "password", "first_name"]),
  async (req, res) => {
    const { email, password, first_name, birthday, username, photo_url } =
      req.body;

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

      res.status(201).send(token);
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
