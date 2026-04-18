create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  avatar_url text,
  role_preference text not null default 'customer' check (role_preference in ('customer', 'provider')),
  verified boolean not null default true,
  rating_average numeric(2,1) not null default 4.8,
  completed_jobs integer not null default 0,
  city text not null default 'Abuja',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references profiles(id) on delete cascade,
  category_id text not null,
  category_name text not null,
  title text not null,
  summary text not null,
  budget_min integer not null,
  budget_max integer not null,
  location text not null,
  urgency text not null,
  status text not null default 'Open',
  bid_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_requests_customer_idx on service_requests(customer_profile_id);
create index if not exists service_requests_created_idx on service_requests(created_at desc);

create table if not exists sponsored_ads (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references profiles(id) on delete cascade,
  service text not null,
  headline text not null,
  body text not null,
  location text not null,
  starting_price text not null,
  budget text not null,
  badge text not null default 'Sponsored',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists sponsored_ads_provider_idx on sponsored_ads(provider_profile_id);
create index if not exists sponsored_ads_created_idx on sponsored_ads(created_at desc);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references profiles(id) on delete cascade,
  provider_profile_id uuid not null references profiles(id) on delete cascade,
  subject text not null,
  category text not null,
  service_request_id uuid references service_requests(id) on delete set null,
  last_message_preview text,
  last_message_at timestamptz not null default now(),
  customer_last_read_at timestamptz,
  provider_last_read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists threads_customer_idx on threads(customer_profile_id, last_message_at desc);
create index if not exists threads_provider_idx on threads(provider_profile_id, last_message_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  sender_profile_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_idx on messages(thread_id, created_at asc);

create table if not exists paystack_transactions (
  id uuid primary key default gen_random_uuid(),
  paystack_reference text not null unique,
  customer_profile_id uuid not null references profiles(id) on delete cascade,
  provider_profile_id uuid references profiles(id) on delete set null,
  provider_name_snapshot text not null,
  service_request_id uuid references service_requests(id) on delete set null,
  title text not null,
  category text not null,
  amount_kobo bigint not null,
  platform_fee_kobo bigint not null,
  total_amount_kobo bigint not null,
  status text not null default 'initialized',
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists escrow_accounts (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid references service_requests(id) on delete set null,
  customer_profile_id uuid not null references profiles(id) on delete cascade,
  provider_profile_id uuid references profiles(id) on delete set null,
  title text not null,
  amount_kobo bigint not null,
  status text not null default 'Protected',
  paystack_reference text not null unique,
  provider_name_snapshot text not null,
  notes text[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists escrow_customer_idx on escrow_accounts(customer_profile_id, updated_at desc);
create index if not exists escrow_provider_idx on escrow_accounts(provider_profile_id, updated_at desc);

create table if not exists earnings_records (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references profiles(id) on delete cascade,
  escrow_account_id uuid not null unique references escrow_accounts(id) on delete cascade,
  title text not null,
  amount_kobo bigint not null,
  status text not null default 'Pending',
  payout_date date,
  notes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists earnings_provider_idx on earnings_records(provider_profile_id, created_at desc);
