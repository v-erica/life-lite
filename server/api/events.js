import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";
import {
  createEvent,
  getEventsByUserId,
  updateEventById,
  deleteEventById,
} from "#db/queries/events";

const normalizeDateTime = (rawValue) => {
  if (rawValue === null || rawValue === "") return { value: null };

  const value =
    typeof rawValue === "string" ? rawValue.trim() : String(rawValue).trim();

  if (!value) return { value: null };

  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    return { error: "Datetime must be a valid ISO datetime." };
  }

  return { value: new Date(ms).toISOString() };
};

router.post(
  "/",
  requireUser,
  requireBody(["title", "event_date"]),
  async (req, res) => {
    const { title, description, event_date, start_time, end_time } = req.body;

    if (!title?.trim() || !event_date?.trim()) {
      return res.status(400).json({ error: "Title and event_date required" });
    }

    const eventDate = event_date.trim();

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
      Number.isNaN(Date.parse(eventDate))
    ) {
      return res.status(400).json({ error: "Event date must be YYYY-MM-DD." });
    }

    const userId = req.user.id;

    const parsedStart = normalizeDateTime(start_time);
    if (parsedStart.error) {
      return res.status(400).json({ error: parsedStart.error });
    }

    const parsedEnd = normalizeDateTime(end_time);
    if (parsedEnd.error) {
      return res.status(400).json({ error: parsedEnd.error });
    }

    if (parsedStart.value && parsedEnd.value) {
      if (new Date(parsedEnd.value) <= new Date(parsedStart.value)) {
        return res
          .status(400)
          .json({ error: "End time must be after start time." });
      }
    }

    try {
      const event = await createEvent(
        userId,
        title,
        description,
        eventDate ?? new Date().toISOString().slice(0, 10),
        parsedStart.value,
        parsedEnd.value,
      );

      return res.status(201).json(event);
    } catch (err) {
      console.error("createEvent failed:", {
        code: err.code,
        message: err.message,
      });
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

router.get("/", requireUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const events = await getEventsByUserId(userId);

    return res.status(200).json(events);
  } catch (err) {
    console.error("getEventsByUserId failed:", {
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/:id", requireUser, async (req, res) => {
  const raw = req.body ?? {};
  const userId = req.user.id;
  const eventId = Number(req.params.id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: "Invalid event id." });
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

  if (raw.event_date !== undefined) {
    const eventDate = raw.event_date?.trim();

    if (!eventDate) {
      return res.status(400).json({ error: "Event date is required." });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
      Number.isNaN(Date.parse(eventDate))
    ) {
      return res.status(400).json({ error: "Event date must be YYYY-MM-DD." });
    }

    updates.event_date = eventDate;
  }

  if (raw.start_time !== undefined) {
    const parsedStart = normalizeDateTime(raw.start_time);
    if (parsedStart.error) {
      return res.status(400).json({ error: parsedStart.error });
    }

    updates.start_time = parsedStart.value;
  }

  if (raw.end_time !== undefined) {
    const parsedEnd = normalizeDateTime(raw.end_time);
    if (parsedEnd.error) {
      return res.status(400).json({ error: parsedEnd.error });
    }

    updates.end_time = parsedEnd.value;
  }

  const startCandidate =
    updates.start_time !== undefined ? updates.start_time : raw.start_time;
  const endCandidate =
    updates.end_time !== undefined ? updates.end_time : raw.end_time;

  if (startCandidate && endCandidate) {
    if (new Date(endCandidate) <= new Date(startCandidate)) {
      return res
        .status(400)
        .json({ error: "End time must be after start time." });
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid event fields provided." });
  }

  try {
    const event = await updateEventById(eventId, userId, updates);

    if (!event) {
      return res.status(404).json({ error: "Event item not found." });
    }

    return res.status(200).json(event);
  } catch (err) {
    console.error("updateEventById failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/:id", requireUser, async (req, res) => {
  const userId = req.user.id;
  const eventId = Number(req.params.id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: "Invalid event id." });
  }

  try {
    const deleted = await deleteEventById(eventId, userId);

    if (!deleted)
      return res.status(404).json({ error: "Event item not found." });

    return res.sendStatus(204);
  } catch (err) {
    console.error("deleteEventById failed:", {
      code: err.code,
      message: err.message,
    });
    return res.status(500).json({ error: "Internal server error." });
  }
});
