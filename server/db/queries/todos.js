import db from "#db/client";

export async function createTodo(
  user_id,
  title,
  description,
  due_date,
  priority,
  completed,
) {
  const sql = `
        insert into todos (user_id, title, description, due_date, priority, completed)
        values ($1, $2, $3, $4, $5, $6)
        returning id, title, description, due_date, priority, completed, created_at
    `;

  try {
    const {
      rows: [todo],
    } = await db.query(sql, [
      user_id,
      title,
      description,
      due_date,
      priority,
      completed,
    ]);

    return todo;
  } catch (err) {
    console.error("createTodo failed:", {
      code: err.code,
      message: err.message,
    });
    throw err;
  }
}

export async function getTodosByUserId(userId) {
  const sql = `
        select
            id,
            title,
            description,
            due_date,
            priority,
            completed
        from todos
        where user_id = $1`;

  try {
    const { rows: todos } = await db.query(sql, [userId]);

    return todos;
  } catch (err) {
    console.error("getTodosByUser failed:", {
      code: err.code,
      message: err.message,
    });
    throw err;
  }
}

export async function updateTodoById(todoId, userId, updates) {
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
  if (updates.due_date !== undefined) addField("due_date", updates.due_date);
  if (updates.priority !== undefined) addField("priority", updates.priority);
  if (updates.completed !== undefined) addField("completed", updates.completed);

  if (setClauses.length === 0) return null;

  setClauses.push("updated_at = now()");

  const sql = `
    update todos
    set ${setClauses.join(", ")}
    where id = $${i}
    and user_id = $${i + 1}
    returning id, title, description, due_date, priority, completed, updated_at
  `;

  values.push(todoId, userId);

  const {
    rows: [todo],
  } = await db.query(sql, values);

  return todo ?? null;
}

export async function deleteTodoById(todoId, userId) {
  const sql = `
    delete from todos
    where id = $1
    and user_id = $2
    returning *
`;

  const {
    rows: [todo],
  } = await db.query(sql, [todoId, userId]);

  return todo ?? null;
}
