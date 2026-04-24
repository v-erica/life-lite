import db from "#db/client";

export async function createBill(
  userId,
  title,
  amount,
  next_due_date,
  recurrence,
  paid,
  last_paid_at,
  is_active,
) {
  const sql = `
        insert into bills (
            user_id,
            title,
            amount,
            next_due_date,
            recurrence,
            paid,
            last_paid_at,
            is_active)
        values (
            $1, $2, $3, $4, $5, $6, $7, $8
        )
        returning id, user_id, title, amount, next_due_date, recurrence, paid, last_paid_at, is_active, created_at;
    `;

  try {
    const {
      rows: [bill],
    } = await db.query(sql, [
      userId,
      title,
      amount,
      next_due_date,
      recurrence,
      paid,
      last_paid_at,
      is_active,
    ]);

    return bill;
  } catch (err) {
    console.error("createBill failed:", {
      code: err.code,
      message: err.message,
    });

    throw err;
  }
}

// need to add queries for getBillsByUserId, updateBillById, deleteBillById
