import db from "#db/client";
import bcrypt from "bcrypt";

// WHY (Functionality): Pre-compute a dummy bcrypt hash at startup.
// getUserByCredentials uses this when no matching user is found so that
// bcrypt.compare still runs and login response time stays consistent.
// Skipping bcrypt for missing users would let attackers guess valid
// usernames just by measuring how long the request takes (timing attack).
const DUMMY_HASH = bcrypt.hashSync("timing-normalization-noop", 10);

/**
 * Creates a new user row, hashing their password before inserting.
 * Returns the new user object (without password_hash).
 */
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

/**
 * Looks up a user by email or username and verifies their password.
 * Returns the user object (without password_hash) on success, or null if
 * the credentials are invalid.
 */
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

  // WHY (Functionality): Always run bcrypt.compare, even when no user was found.
  // If we returned early here, the server would respond much faster for unknown
  // emails than for wrong passwords — and an attacker could use that timing
  // difference to enumerate valid usernames. Using DUMMY_HASH when no user
  // exists keeps the response time consistent regardless of the input.
  const hash = user?.password_hash ?? DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hash);

  if (!user || !isValid) return null;

  delete user.password_hash;
  return user;
}

/**
 * Fetches a single user by their numeric ID.
 * Returns the user object (without password_hash), or null if not found.
 */
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

/**
 * Updates allowed profile fields for a user by ID.
 * Accepts a partial `updates` object; only provided fields are changed.
 * Returns the updated user object, or null if the user was not found.
 */
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
