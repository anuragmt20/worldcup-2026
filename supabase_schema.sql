-- ==========================================
-- Supabase Schema for FIFA World Cup 2026 Portal
-- ==========================================

-- 1. Create Profiles Table (extends Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  points integer default 0,
  correct_predictions integer default 0,
  total_predictions integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Allow public read access to profiles" on public.profiles 
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles 
  for update using (auth.uid() = id);

-- 2. Create Predictions Table
create table public.predictions (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id text not null,
  predicted_winner text check (predicted_winner in ('home', 'away', 'draw')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, match_id)
);

-- Enable RLS for predictions
alter table public.predictions enable row level security;

-- Policies for predictions
create policy "Allow public read access to predictions" on public.predictions 
  for select using (true);

create policy "Allow logged in users to insert their own predictions" on public.predictions 
  for insert with check (auth.uid() = user_id);

create policy "Allow logged in users to update their own predictions" on public.predictions 
  for update using (auth.uid() = user_id);

-- 3. Trigger to calculate predictions accuracy and points
-- This function runs automatically whenever a user inserts/updates a prediction
-- or whenever matches are simulated. For a lightweight setup, points can also
-- be pushed directly from the client, but here is a simple profile trigger.

-- Trigger to automatically create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, points, correct_predictions, total_predictions)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    0,
    0,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
