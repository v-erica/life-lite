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

export async function getBillsByUserId(userId) {
  const sql = `
        select
            id,
            user_id,
            title,
            amount,
            next_due_date,
            recurrence,
            paid,
            last_paid_at,
            is_active,
            created_at,
            updated_at
        from bills
        where user_id = $1
        and is_active = true
        order by next_due_date asc, title asc
    `;
  try {
    const { rows: bills } = await db.query(sql, [userId]);

    return bills;
  } catch (err) {
    ("getBillsByUserId failed:",
      {
        code: err.code,
        message: err.message,
      });
    throw err;
  }
}

export async function getBillById(billId, userId) {
  const sql = `
        select
            id,
            user_id,
            title,
            amount,
            next_due_date,
            recurrence,
            paid,
            last_paid_at,
            is_active,
            created_at,
            updated_at
        from bills
        where id = $1
        and user_id = $2
    `;
  try {
    const {
      rows: [bill],
    } = await db.query(sql, [billId, userId]);

    return bill;
  } catch (err) {
    ("getBillById failed:",
      {
        code: err.code,
        message: err.message,
      });
    throw err;
  }
}

export async function updateBillById(billId, userId, updates) {
  const setClauses = [];
  const values = [];
  let i = 1;

  const addField = (column, value) => {
    setClauses.push(`${column} = $${i}`);
    values.push(value);
    i += 1;
  };

  if (updates.title !== undefined) addField("title", updates.title);
  if (updates.amount !== undefined) addField("amount", updates.amount);
  if (updates.next_due_date !== undefined)
    addField("next_due_date", updates.next_due_date);
  if (updates.recurrence !== undefined)
    addField("recurrence", updates.recurrence);
  if (updates.paid !== undefined) addField("paid", updates.paid);
  if (updates.last_paid_at !== undefined)
    addField("last_paid_at", updates.last_paid_at);
  if (updates.is_active !== undefined) addField("is_active", updates.is_active);

  if (setClauses.length === 0) return null;

  setClauses.push("updated_at = now()");

  const sql = `
        update bills
        set ${setClauses.join(", ")}
        where id = $${i}
        and user_id = $${i + 1}
        returning id, user_id, title, amount, next_due_date, recurrence, paid, last_paid_at, is_active, created_at, updated_at
    `;

  values.push(billId, userId);

  const {
    rows: [bill],
  } = await db.query(sql, values);

  return bill ?? null;
}

export async function markBillPaid(billId, userId) {
  const sql = `
        update bills
        set last_paid_at = now(),
            paid = case when recurrence = 'once' then true else false end,
            is_active = case when recurrence = 'once' then false else is_active end,
            next_due_date = case 
                            when recurrence = 'weekly' then (next_due_date + interval '7 days')::date
                            when recurrence = 'monthly' then (next_due_date + interval '1 month')::date
                            when recurrence = 'annually' then (next_due_date + interval '1 year')::date
                            else next_due_date
                            end,
            updated_at = now()
        where id = $1
        and user_id = $2
        and is_active = true
        returning id, user_id, title, amount, next_due_date, recurrence, paid, last_paid_at, is_active, created_at, updated_at
    `;

  const {
    rows: [bill],
  } = await db.query(sql, [billId, userId]);

  return bill ?? null;
}

export async function deleteBillById(billId, userId) {
  const sql = `
        delete from bills
        where id = $1
        and user_id = $2
        returning *
    `;

  const {
    rows: [bill],
  } = await db.query(sql, [billId, userId]);

  return bill ?? null;
}
