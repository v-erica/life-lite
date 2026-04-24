import express from "express";

const router = express.Router();

export default router;

const user = useContext();

router.post("/", requireBody(["title", "amount"]), async (req, res) => {
  const { title, amount } = req.body;

  const amountFormatted = Number(amount);

  // need to title (not empty) validate amount (format and not empty or negative), next_due_date (format), recurrence (limited options), last_paid_at (format)

  const response = await createBill(
    userId,
    title,
    amount,
    next_due_date,
    recurrence,
    paid,
    last_paid_at,
    is_active,
  );
});

// need to add routes for get, update, and delete
