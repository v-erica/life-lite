import db from "#db/client";

import { createUser } from "#db/queries/users";
import { createTodo } from "#db/queries/todos";
import { createEvent } from "#db/queries/events";

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
      photo_url: "https://media1.tenor.com/m/CJAzSgd6Vu8AAAAC/cute-cat-cat.gif",
    },
  ];

  for (const user of users) {
    await createUser(
      user.email,
      user.password,
      user.first_name,
      user.birthday,
      user.username,
      user.photo_url,
    );
  }

  const todos = [
    {
      user_id: 1,
      title: "put away seasonal decor",
      priority: "high",
      due_date: "2026-04-19",
    },
    {
      user_id: 1,
      title: "check on balcony plants",
      priority: "medium",
      due_date: "2026-04-19",
    },
    {
      user_id: 1,
      title: "clean apartment",
    },
  ];

  for (const todo of todos) {
    await createTodo(
      todo.user_id,
      todo.title,
      todo.description,
      todo.due_date,
      todo.priority ?? "low",
      todo.completed ?? false,
    );
  }

  const events = [
    {
      user_id: 1,
      title: "Capstone Defense",
      event_date: "2026-04-22",
    },
    {
      user_id: 1,
      title: "Capstone Presentation",
      event_date: "2026-04-27",
    },
    {
      user_id: 1,
      title: "Graduation!!",
      event_date: "2026-04-29",
    },
  ];

  for (const event of events) {
    await createEvent(
      event.user_id,
      event.title,
      event.description,
      event.event_date ?? new Date().toISOString().slice(0, 10),
      event.start_time,
      event.end_time,
    );
  }
}
