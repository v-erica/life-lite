import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { verifyDbConnection } from "#db/connection";
import getUserFromToken from "#middleware/getUserFromToken";
import db from "#db/client";

import usersRouter from "./api/users.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await db.connect();

verifyDbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "life-lite-server" });
});

app.use(getUserFromToken);

app.use("/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});
