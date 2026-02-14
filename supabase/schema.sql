-- AutoLocal Platform v2 Schema

-- Businesses table
create table if not exists businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  industry text,
  address text,
  phone text,
  website_url text,
  logo_url text,
  brand_colors jsonb default '[]'::jsonb,
  style_preset text default 'warm_personal',
  brand_description text,
  services text[],
  differentiator text,
  target_customer text,
  posting_frequency int default 5,
  preferred_days text[] default '{Mon,Tue,Wed,Thu,Fri}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Brand profiles (extended brand info)
create table if not exists brand_profiles (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  voice_description text,
  emoji_usage text default 'moderate',
  caption_style text default 'mixed',
  hashtag_count int default 5,
  learned_preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  caption text not null,
  image_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  status text default 'pending' check (status in ('pending','approved','published','rejected')),
  content_type text default 'promotional',
  platforms text[] default '{facebook,instagram}',
  rating int,
  rating_feedback text,
  photo_upload boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Social connections
create table if not exists social_connections (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  platform text not null,
  connected boolean default false,
  access_token text,
  refresh_token text,
  platform_user_id text,
  connected_at timestamptz,
  created_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade not null,
  plan text default 'trial' check (plan in ('trial','starter','growth','pro')),
  status text default 'active' check (status in ('active','cancelled','expired')),
  trial_ends_at timestamptz default (now() + interval '7 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- RLS policies
alter table businesses enable row level security;
alter table brand_profiles enable row level security;
alter table posts enable row level security;
alter table social_connections enable row level security;
alter table subscriptions enable row level security;

create policy "Users can manage own businesses" on businesses for all using (auth.uid() = user_id);
create policy "Users can manage own brand profiles" on brand_profiles for all using (business_id in (select id from businesses where user_id = auth.uid()));
create policy "Users can manage own posts" on posts for all using (business_id in (select id from businesses where user_id = auth.uid()));
create policy "Users can manage own social connections" on social_connections for all using (business_id in (select id from businesses where user_id = auth.uid()));
create policy "Users can manage own subscriptions" on subscriptions for all using (business_id in (select id from businesses where user_id = auth.uid()));
