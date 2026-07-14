-- profiles table: only used once optional auth/sign-in is added later.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  timezone text,
  energy_baseline text check (energy_baseline in ('low', 'medium', 'high')),
  stress_threshold text check (stress_threshold in ('low', 'medium', 'high')),
  biggest_hurdle text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = user_id);
