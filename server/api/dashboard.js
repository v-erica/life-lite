import express from "express";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.get("/", requireUser, async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      first_name: req.user.first_name,
    },
    widgets: {
      todos: [],
      notes: [],
      bills: [],
      birthdays: [],
      calendar: [],
    },
    generated_at: new Date().toISOString(),
  });
});

export default router;
