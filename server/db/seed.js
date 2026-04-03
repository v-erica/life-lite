import db from "#db/client";

import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 database seeded.");

async function seed() {
  const users = [
    {
      username: "vanilla_being",
      email: "veolivos90@gmail.com",
      password: "lifelitepassword",
      first_name: "vanessa",
      birthday: "1990-04-11",
    },
  ];

  for (const user of users) {
    const createdUser = await createUser(
      user.email,
      user.password,
      user.first_name,
      user.birthday,
      user.username,
      user.photo_url,
    );
  }
}
