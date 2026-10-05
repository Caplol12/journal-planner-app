-- ==============================================================================
-- اسکریپت امن و کامل ساخت پایگاه‌داده، باکت ذخیره‌سازی و همگام‌سازی ژورنال‌ها در Supabase
-- این اسکریپت را در بخش SQL Editor پنل کاربری Supabase خود اجرا (Run) کنید.
-- ==============================================================================

-- ۱. ساخت باکت ذخیره‌سازی برای قالب‌ها (Storage Bucket)
insert into storage.buckets (id, name, public)
values ('templates', 'templates', true)
on conflict (id) do nothing;

-- حذف سیاست‌های قبلی در صورت وجود (برای جلوگیری از تداخل)
drop policy if exists "Templates files are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload template files" on storage.objects;
drop policy if exists "Users can update and delete their own template files" on storage.objects;
drop policy if exists "Users can update own template files" on storage.objects;
drop policy if exists "Users can delete template files" on storage.objects;
drop policy if exists "Admins or owners can delete template files" on storage.objects;

-- ۲. دسترسی همگانی برای خواندن و مشاهده فایل‌های قالب
create policy "Templates files are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'templates' );

-- ۳. دسترسی آپلود فایل برای کاربران احراز هویت‌شده
create policy "Authenticated users can upload template files"
  on storage.objects for insert
  with check ( bucket_id = 'templates' and auth.role() = 'authenticated' );

-- سیاست امن: ویرایش فقط توسط مالک فایل یا مدیر کل (Admin)
create policy "Users can update own template files"
  on storage.objects for update
  using (
    bucket_id = 'templates' and (
      auth.uid() = owner or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );

-- سیاست امن: حذف فایل فقط توسط مالک فایل یا مدیر کل (Admin)
create policy "Admins or owners can delete template files"
  on storage.objects for delete
  using (
    bucket_id = 'templates' and (
      auth.uid() = owner or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );

-- ۴. ساخت جدول مشخصات و نقش کاربران (Profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ۵. ساخت جدول قالب‌های ابری (Templates)
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  badge text default 'قالب ابری',
  description text,
  icon text default '📑',
  category text default 'daily',
  storage_path text,
  html_content text,
  preview_url text,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ۶. ساخت جدول ژورنال‌ها و برنامه‌های اختصاصی کاربران (User Journals) برای پشتیبان و همگام‌سازی ابری
create table if not exists public.user_journals (
  id text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  color text default '#5fa8e8',
  theme text default 'sage',
  starred boolean default false,
  cover_image text,
  created_at text,
  pages jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id, user_id)
);

-- ۷. فعال‌سازی امنیت سطح سطر (Row Level Security - RLS)
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.user_journals enable row level security;

-- ۸. قوانین دسترسی جدول قالب‌ها
drop policy if exists "Public templates are viewable by everyone" on public.templates;
drop policy if exists "Admins can manage templates" on public.templates;

create policy "Public templates are viewable by everyone"
  on public.templates for select
  using (is_active = true);

create policy "Admins can manage templates"
  on public.templates for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ۹. قوانین دسترسی جدول پروفایل‌ها
drop policy if exists "Users can see own profile or admin sees all" on public.profiles;
drop policy if exists "Admins can update roles" on public.profiles;

create policy "Users can see own profile or admin sees all"
  on public.profiles for select
  using (
    auth.uid() = id or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can update roles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ۱۰. قوانین دسترسی جدول ژورنال‌های کاربر (هر کاربر فقط به ژورنال‌های خود دسترسی دارد)
drop policy if exists "Users can manage their own journals" on public.user_journals;

create policy "Users can manage their own journals"
  on public.user_journals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ۱۱. تریگر برای ساخت خودکار پروفایل هنگام ثبت‌نام کاربر در Supabase Auth (ایمن در برابر Race Condition)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- استفاده از قفل مشورتی تراکنش برای جلوگیری از ایجاد همزمان دو ادمین اول
  perform pg_advisory_xact_lock(749281);

  -- اولین کاربری که ثبت نام کند، به صورت خودکار مدیر کل (admin) می‌شود
  select count(*) = 0 into is_first_user from public.profiles;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when lower(new.email) = 'montypop353@gmail.com' or is_first_user then 'admin' else 'user' end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name);

  return new;
end;
$$ language plpgsql security definer;

-- اتصال تریگر به جدول کاربران Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
