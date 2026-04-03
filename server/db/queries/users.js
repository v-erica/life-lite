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
        returning *;
    `;

  const hashedPassword = await bcrypt.hash(password, 10);

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
}
