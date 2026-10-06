-- Cat Nap Fund initial schema. Run in the Supabase SQL editor.

create table allowed_users (
  email text primary key check (email = lower(email))
);

create table goals (
  id text primary key check (id in ('emergency', 'moveout')),
  name text not null,
  target_cents bigint not null check (target_cents >= 0),
  target_date date
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  goal_id text not null references goals(id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal')),
  amount_cents bigint not null check (amount_cents > 0),
  person text not null check (person in ('a', 'b')),
  note text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index transactions_goal_idx on transactions (goal_id, date desc);

create table settings (
  id int primary key default 1 check (id = 1),
  name_a text not null default 'John',
  name_b text not null default 'Partner',
  monthly_expenses_cents bigint not null default 0 check (monthly_expenses_cents >= 0)
);

create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount_cents bigint not null default 0 check (amount_cents >= 0),
  position int not null default 0
);

insert into goals (id, name, target_cents) values
  ('emergency', 'Emergency Fund', 1000000),
  ('moveout', 'Move-Out Fund', 800000);
insert into settings (id) values (1);
insert into checklist_items (label, position) values
  ('First month''s rent', 0), ('Security deposit', 1), ('Movers', 2), ('Furniture', 3);

-- Allowlist check. SECURITY DEFINER so it can read allowed_users despite RLS.
create function is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from allowed_users where email = lower(auth.jwt() ->> 'email')
  );
$$;

-- Lets the login screen show a friendly "not invited" message before sending a link.
create function is_email_invited(check_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_users where email = lower(check_email));
$$;
grant execute on function is_email_invited(text) to anon, authenticated;

alter table allowed_users enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;
alter table settings enable row level security;
alter table checklist_items enable row level security;

-- Only allowlisted users can do anything. allowed_users is readable (not writable) by them;
-- add emails via the SQL editor / dashboard (service role).
create policy "allowed read" on allowed_users for select to authenticated using (is_allowed());
create policy "allowed all" on goals for all to authenticated using (is_allowed()) with check (is_allowed());
create policy "allowed all" on transactions for all to authenticated using (is_allowed()) with check (is_allowed());
create policy "allowed all" on settings for all to authenticated using (is_allowed()) with check (is_allowed());
create policy "allowed all" on checklist_items for all to authenticated using (is_allowed()) with check (is_allowed());

-- Realtime
alter publication supabase_realtime add table goals, transactions, settings, checklist_items;

-- Then add the two emails (lowercase):
-- insert into allowed_users (email) values ('you@example.com'), ('partner@example.com');
