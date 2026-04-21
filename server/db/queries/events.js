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
        returning user_id, id, title, description, event_date, start_time, end_time
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

export async function getEventsByUserId(userId) {
  const sql = `
        select
            id,
            title,
            description,
            event_date,
            start_time,
            end_time
        from events
        where user_id = $1`;

  try {
    const { rows: events } = await db.query(sql, [userId]);

    return events;
  } catch (err) {
    console.error("getEventsByUser failed:", {
      code: err.code,
      message: err.message,
    });
    throw err;
  }
}

export async function updateEventById(eventId, userId, updates) {
  const setClauses = [];
  const values = [];
  let i = 1;

  const addField = (column, value) => {
    setClauses.push(`${column} = $${i}`);
    values.push(value);
    i += 1;
  };

  if (updates.title !== undefined) addField("title", updates.title);
  if (updates.description !== undefined)
    addField("description", updates.description);
  if (updates.event_date !== undefined)
    addField("event_date", updates.event_date);
  if (updates.start_time !== undefined)
    addField("start_time", updates.start_time);
  if (updates.end_time !== undefined) addField("end_time", updates.end_time);

  if (setClauses.length === 0) return null;

  setClauses.push("updated_at = now()");

  const sql = `
    update events
    set ${setClauses.join(", ")}
    where id = $${i}
    and user_id = $${i + 1}
    returning id, title, description, event_date, start_time, end_time, updated_at
  `;

  values.push(eventId, userId);

  const {
    rows: [event],
  } = await db.query(sql, values);

  return event ?? null;
}

export async function deleteEventById(eventId, userId) {
  const sql = `
    delete from events
    where id = $1
    and user_id = $2
    returning *
`;

  const {
    rows: [event],
  } = await db.query(sql, [eventId, userId]);

  return event ?? null;
}
