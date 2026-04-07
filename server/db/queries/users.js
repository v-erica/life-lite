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

export async function getUserByCredentials(email, password) {
  const sql = `
  select 
    id, 
    email, 
    password_hash, 
    first_name, 
    birthday
  from users
  where email = $1`;

  const {
    rows: [user],
  } = await db.query(sql, [email]);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) return null;

  delete user.password_hash;
  return user;
}
