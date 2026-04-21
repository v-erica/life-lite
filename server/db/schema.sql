DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id serial primary key,
    email text unique not null,
    password_hash text not null,
    first_name text not null,
    birthday date,
    username text unique,
    photo_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz 
);

CREATE TABLE todos (
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    title text not null,
    description text,
    due_date date,
    priority text not null default 'low',
    completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

CREATE TABLE events (
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    title text not null,
    description text,
    event_date date not null default current_date,
    start_time timestamptz,
    end_time timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);