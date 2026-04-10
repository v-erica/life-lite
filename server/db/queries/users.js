import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser(
  email,
  password,
  first_name,
  birthday,
  username,
  photo_url,
) {
  const sql = `
        insert into users
            (email, password_hash, first_name, birthday, username, photo_url)
        values($1, $2, $3, $4, $5, $6)
        returning id, email, first_name, birthday, username, photo_url;
    `;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const {
      rows: [user],
    } = await db.query(sql, [
      email,
      hashedPassword,
      first_name,
      birthday,
      username,
      photo_url,
    ]);

    return user;
  } catch (err) {
    console.error("createUser failed:", {
      code: err.code,
      message: err.message,
    });
    throw err;
  }
}

export async function getUserByCredentials(identifier, password) {
  const sql = `
  select 
    id, 
    email, 
    password_hash, 
    first_name, 
    birthday
  from users
  where email = $1 or username = $1`;

  const {
    rows: [user],
  } = await db.query(sql, [identifier]);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) return null;

  delete user.password_hash;
  return user;
}

export async function getUserById(id) {
  const sql = `
    select 
      id,
      email,
      username,
      first_name,
      birthday,
      photo_url
    from users
    where id = $1
  `;

  const {
    rows: [user],
  } = await db.query(sql, [id]);

  if (!user) return null;

  return user;
}

export async function updateUserById(id, updates) {
  const setClauses = [];
  const values = [];
  let i = 1;

  const addField = (column, value) => {
    setClauses.push(`${column} = $${i}`);
    values.push(value);
    i += 1;
  };

  if (updates.email !== undefined) addField("email", updates.email);
  if (updates.first_name !== undefined)
    addField("first_name", updates.first_name);
  if (updates.username !== undefined) addField("username", updates.username);
  if (updates.birthday !== undefined) addField("birthday", updates.birthday);
  if (updates.photo_url !== undefined) addField("photo_url", updates.photo_url);

  if (updates.password !== undefined) {
    const passwordHash = await bcrypt.hash(updates.password, 10);
    addField("password_hash", passwordHash);
  }

  if (setClauses.length === 0) return null;

  setClauses.push("updated_at = now()");

  const sql = `
    update users
    set ${setClauses.join(", ")}
    where id = $${i}
    returning id, email, username, first_name, birthday, photo_url, updated_at
  `;

  values.push(id);

  const {
    rows: [user],
  } = await db.query(sql, values);

  return user ?? null;
}
