import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  createTodo,
  getTodosByUserId,
  updateTodoById,
  deleteTodoById,
} from "#db/queries/todos";

router.post("/", requireUser, requireBody(["title"]), async (req, res) => {
  const { title, description, due_date, priority, completed } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: "Title required" });
  }

  const userId = req.user.id;

  try {
    const todo = await createTodo(
      userId,
      title,
      description,
      due_date,
      priority ?? "low",
      completed ?? false,
    );

    return res.status(201).json(todo);
  } catch (err) {
    console.error("createTodo failed:", {
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/", requireUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const todos = await getTodosByUserId(userId);

    return res.status(200).json(todos);
  } catch (err) {
    console.error("getTodosByUserId failed:", {
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/:id", requireUser, async (req, res) => {
  const raw = req.body ?? {};
  const userId = req.user.id;
  const todoId = Number(req.params.id);

  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({ error: "Invalid to-do id." });
  }

  const updates = {};

  if (raw.title !== undefined) {
    const title = raw.title?.trim();

    if (!title)
      return res.status(400).json({ error: "Title cannot be empty." });

    updates.title = title;
  }

  if (raw.description !== undefined) {
    const description = raw.description?.trim() ?? "";

    if (description.length > 1000)
      return res
        .status(400)
        .json({ error: "Description is too long (max 1000)." });

    updates.description = description || null;
  }

  if (raw.due_date !== undefined) {
    const dueDate = raw.due_date?.trim();

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
      Number.isNaN(Date.parse(dueDate))
    ) {
      return res.status(400).json({ error: "Due date must be YYYY-MM-DD." });
    }

    updates.due_date = dueDate;
  }

  if (raw.priority !== undefined) {
    const priority = raw.priority?.trim().toLowerCase();
    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority)) {
      return res
        .status(400)
        .json({ error: "Priority must be low, medium, or high." });
    }

    updates.priority = priority || "low";
  }

  if (raw.completed !== undefined) {
    if (typeof raw.completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "Completed must be true or false." });
    }

    updates.completed = raw.completed;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid to-do fields provided." });
  }

  try {
    const todo = await updateTodoById(todoId, userId, updates);

    if (!todo) {
      return res.status(404).json({ error: "To-do item not found." });
    }

    return res.status(200).json(todo);
  } catch (err) {
    console.error("updateTodoById failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/:id", requireUser, async (req, res) => {
  const userId = req.user.id;
  const todoId = Number(req.params.id);

  if (!Number.isInteger(todoId) || todoId <= 0) {
    return res.status(400).json({ error: "Invalid to-do id." });
  }

  try {
    const deleted = await deleteTodoById(todoId, userId);

    if (!deleted)
      return res.status(404).json({ error: "To-do item not found." });

    return res.sendStatus(204);
  } catch (err) {
    console.error("deleteTodoById failed:", {
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});
