import express from "express";
import requireBody from "#middleware/requireBody";
import {
  createBill,
  getBillsByUserId,
  updateBillById,
  deleteBillById,
  markBillPaid,
} from "#db/queries/bills";

const router = express.Router();
export default router;

const allowedRecurrences = ["once", "weekly", "monthly", "annually"];

router.post(
  "/",
  requireBody(["title", "amount", "next_due_date"]),
  async (req, res) => {
    const { title, amount, next_due_date, recurrence, paid } = req.body;
    const userId = req.user.id;

    const amountValue = Number(amount);

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title and amount are required" });
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be greater than 0." });
    }

    const dateValue = next_due_date?.trim();

    if (
      !dateValue ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ||
      Number.isNaN(Date.parse(dateValue))
    ) {
      return res
        .status(400)
        .json({ error: "Next due date must be YYYY-MM-DD" });
    }

    const recurrenceValue = recurrence?.trim().toLowerCase() || "monthly";

    if (!allowedRecurrences.includes(recurrenceValue)) {
      return res.status(400).json({
        error: "Recurrence must be once, weekly, monthly, or annually",
      });
    }

    const paidValue = paid ?? false;

    if (typeof paidValue !== "boolean") {
      return res.status(400).json({ error: "paid must be true or false" });
    }

    const lastPaidAtValue = paidValue ? new Date().toISOString() : null;

    try {
      const bill = await createBill(
        userId,
        title.trim(),
        amountValue,
        dateValue,
        recurrenceValue,
        paidValue,
        lastPaidAtValue,
        true,
      );

      return res.status(201).json(bill);
    } catch (err) {
      console.error("createBill route failed:", {
        code: err.code,
        message: err.message,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/", async (req, res) => {
  const userId = req.user.id;

  try {
    const bills = await getBillsByUserId(userId);

    return res.status(200).json(bills);
  } catch (err) {
    console.error("getBillsByUserId route failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/pay", async (req, res) => {
  const userId = req.user.id;
  const billId = Number(req.params.id);

  if (!Number.isInteger(billId) || billId <= 0) {
    return res.status(400).json({ error: "Invalid bill id" });
  }

  try {
    const bill = await markBillPaid(billId, userId);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    return res.status(200).json(bill);
  } catch (err) {
    console.error("markBillPaid route failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const userId = req.user.id;

  const raw = req.body ?? {};
  const billId = Number(req.params.id);

  if (!Number.isInteger(billId) || billId <= 0) {
    return res.status(400).json({ error: "Invalid bill id" });
  }

  const updates = {};

  if (raw.title != undefined) {
    const title = raw.title?.trim();

    if (!title) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    updates.title = title;
  }

  if (raw.amount !== undefined) {
    const amountValue = Number(raw.amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be greater than 0." });
    }

    updates.amount = amountValue;
  }

  if (raw.next_due_date !== undefined) {
    const dateValue = raw.next_due_date?.trim();

    if (
      !dateValue ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ||
      Number.isNaN(Date.parse(dateValue))
    ) {
      return res
        .status(400)
        .json({ error: "Next due date must be YYYY-MM-DD" });
    }

    updates.next_due_date = dateValue;
  }

  if (raw.recurrence !== undefined) {
    const recurrenceValue = raw.recurrence?.trim().toLowerCase();

    if (!allowedRecurrences.includes(recurrenceValue)) {
      return res.status(400).json({
        error: "Recurrence must be once, weekly, monthly, or annually",
      });
    }

    updates.recurrence = recurrenceValue;
  }

  if (raw.is_active !== undefined) {
    if (typeof raw.is_active !== "boolean") {
      return res.status(400).json({ error: "is_active must be true or false" });
    }

    updates.is_active = raw.is_active;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid bill fields provided" });
  }

  try {
    const bill = await updateBillById(billId, userId, updates);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    return res.status(200).json(bill);
  } catch (err) {
    console.error("updateBillById route failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/:id", async (req, res) => {
  const userId = req.user.id;
  const billId = Number(req.params.id);

  if (!Number.isInteger(billId) || billId <= 0) {
    return res.status(400).json({ error: "Invalid bill id" });
  }

  try {
    const deleted = await deleteBillById(billId, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Bill not found" });
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error("deleteBillById route failed:", {
      code: err.code,
      message: err.message,
    });

    return res.status(500).json({ error: "Internal server error" });
  }
});
