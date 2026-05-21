create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text,
  city text,
  description text,
  address text,
  phone text,
  email text,
  whatsapp text,
  website_url text,
  google_maps_url text,
  instagram_url text,
  rating numeric,
  review_count integer,
  status text default 'new',
  opportunity_score integer,
  website_quality_score integer,
  main_problem_detected text,
  detected_problems jsonb,
  recommendations jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.generated_websites (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  business_profile jsonb not null,
  website jsonb not null,
  seo jsonb,
  contact jsonb,
  confidence jsonb,
  demo_slug text unique,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.generated_websites add column if not exists business_profile jsonb;
alter table if exists public.generated_websites add column if not exists website jsonb;
alter table if exists public.generated_websites add column if not exists seo jsonb;
alter table if exists public.generated_websites add column if not exists contact jsonb;
alter table if exists public.generated_websites add column if not exists confidence jsonb;
alter table if exists public.generated_websites add column if not exists demo_slug text;
alter table if exists public.generated_websites add column if not exists status text default 'draft';

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  generated_website_id uuid references public.generated_websites(id) on delete set null,
  channel text,
  subject text,
  body text,
  status text default 'draft',
  created_at timestamptz default now(),
  sent_at timestamptz
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text,
  city text,
  category text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  type text,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists public.generated_website_versions (
  id uuid primary key default gen_random_uuid(),
  generated_website_id uuid references public.generated_websites(id) on delete cascade,
  version_number integer,
  change_type text,
  instruction text,
  snapshot jsonb,
  created_at timestamptz default now()
);

create table if not exists public.places_data (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  place_id text,
  raw_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.website_research (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  website_url text,
  title text,
  description text,
  summary text,
  extracted_data jsonb,
  detected_problems jsonb,
  created_at timestamptz default now()
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade unique,
  profile jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  value jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists generated_websites_set_updated_at on public.generated_websites;
create trigger generated_websites_set_updated_at
before update on public.generated_websites
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

drop trigger if exists business_profiles_set_updated_at on public.business_profiles;
create trigger business_profiles_set_updated_at
before update on public.business_profiles
for each row execute function public.set_updated_at();
