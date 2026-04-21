import db from "#db/client";

export async function createEvent(
  userId,
  title,
  description,
  event_date,
  start_time,
  end_time,
) {
  const sql = `
        insert into events (user_id, title, description, event_date, start_time, end_time)
        values ($1, $2, $3, $4, $5, $6)
        returning user_id, title, description, event_date, start_time, end_time
    `;

  const {
    rows: [event],
  } = await db.query(sql, [
    userId,
    title,
    description,
    event_date,
    start_time,
    end_time,
  ]);

  return event;
}
