import express from "express";
const router = express.Router();
export default router;

import {
  createUser,
  getUserByCredentials,
  updateUserById,
} from "#db/queries/users";
import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

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

router.post(
  "/login",
  requireBody(["identifier", "password"]),
  async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ error: "Username/email and password are required." });
    }

    try {
      const user = await getUserByCredentials(identifier, password);

      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid username/email or password." });
      }

      const token = createToken({ sub: user.id });

      return res.status(200).json({ token });
    } catch (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

router.get("/me", requireUser, async (req, res) => {
  res.json(req.user);
});

router.patch("/me", requireUser, async (req, res) => {
  const raw = req.body ?? {};

  const updates = {};

  if (raw.email !== undefined) {
    const email = raw.email?.trim();

    if (!email)
      return res.status(400).json({ error: "Email cannot be empty." });

    updates.email = email;
  }

  if (raw.first_name !== undefined) {
    const firstName = raw.first_name?.trim();

    if (!firstName)
      return res.status(400).json({ error: "First name cannot be empty." });

    updates.first_name = firstName;
  }

  if (raw.password !== undefined) {
    const password = raw.password?.trim();

    if (!password) {
      return res.status(400).json({ error: "Password cannot be empty." });
    }

    updates.password = password;
  }

  if (raw.username !== undefined) {
    const username = raw.username?.trim();

    updates.username = username || null;
  }

  if (raw.birthday !== undefined) {
    const birthday = raw.birthday?.trim();

    updates.birthday = birthday || null;
  }

  if (raw.photo_url !== undefined) {
    const photoUrl = raw.photo_url?.trim();

    updates.photo_url = photoUrl || null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid profile fields provided." });
  }

  try {
    const user = await updateUserById(req.user.id, updates);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(user);
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

    return res.status(500).json({ error: "Internal server error." });
  }
});
