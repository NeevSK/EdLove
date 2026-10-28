-- Minimal Supabase-shaped stub for migration replay (local throwaway Postgres only)
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create role authenticator login noinherit; grant anon,authenticated,service_role to authenticator;
create role supabase_admin superuser; create role supabase_auth_admin; create role supabase_storage_admin; create role dashboard_user; create role supabase_realtime_admin;
create schema extensions; create schema auth; create schema storage; create schema realtime; create schema vault; create schema graphql_public;
grant usage on schema public, extensions, auth, storage to anon, authenticated, service_role;
create extension pgcrypto schema extensions; create extension "uuid-ossp" schema extensions; create extension pg_trgm schema extensions;
create extension vector schema extensions; create extension postgis schema extensions;
alter database postgres set search_path = "$user", public, extensions;
set search_path = "$user", public, extensions;
create table auth.users (instance_id uuid, id uuid primary key, aud varchar(255), role varchar(255), email varchar(255) unique, encrypted_password varchar(255),
 email_confirmed_at timestamptz, invited_at timestamptz, confirmation_token varchar(255) default '', confirmation_sent_at timestamptz, recovery_token varchar(255) default '',
 recovery_sent_at timestamptz, email_change_token_new varchar(255) default '', email_change varchar(255) default '', email_change_sent_at timestamptz, last_sign_in_at timestamptz,
 raw_app_meta_data jsonb, raw_user_meta_data jsonb, is_super_admin bool, created_at timestamptz default now(), updated_at timestamptz default now(), phone text unique default null,
 phone_confirmed_at timestamptz, phone_change text default '', phone_change_token varchar(255) default '', phone_change_sent_at timestamptz, confirmed_at timestamptz,
 email_change_token_current varchar(255) default '', email_change_confirm_status smallint default 0, banned_until timestamptz, reauthentication_token varchar(255) default '',
 reauthentication_sent_at timestamptz, is_sso_user bool default false, deleted_at timestamptz, is_anonymous bool default false);
create table auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, provider text, provider_id text, identity_data jsonb, email text, created_at timestamptz default now(), updated_at timestamptz default now(), last_sign_in_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role', true), '')::text $$;
create function auth.email() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.email', true), '')::text $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create table storage.buckets (id text primary key, name text unique not null, owner uuid, public boolean default false, file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now(), updated_at timestamptz default now());
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid, metadata jsonb, created_at timestamptz default now(), updated_at timestamptz default now(), last_accessed_at timestamptz default now());
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
create function storage.filename(name text) returns text language sql immutable as $$ select (string_to_array(name, '/'))[array_length(string_to_array(name, '/'),1)] $$;
create function storage.extension(name text) returns text language sql immutable as $$ select reverse(split_part(reverse(name), '.', 1)) $$;
create publication supabase_realtime;
