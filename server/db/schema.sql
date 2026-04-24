DROP TABLE IF EXISTS bills;
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

CREATE TABLE bills (
    id serial primary key,
    user_id int not null references users(id) on delete cascade,
    title text not null,
    amount numeric(10,2) not null check (amount >= 0),
    next_due_date date not null default current_date,
    recurrence text not null default 'monthly' check (recurrence in ('once', 'weekly', 'monthly', 'annually')),
    paid boolean not null default false,
    last_paid_at timestamptz,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz
);
