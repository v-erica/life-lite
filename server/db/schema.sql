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