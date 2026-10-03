-- ==============================================================================
-- اسکریپت ساخت دیتابیس و باکت ذخیره‌سازی در Supabase برای سیستم ژورنال و پلنر
-- این کد را در بخش SQL Editor پنل کاربری Supabase خود کپی و اجرا (Run) کنید.
-- ==============================================================================

-- ۱. ساخت باکت ذخیره‌سازی برای قالب‌ها (Storage Bucket)
insert into storage.buckets (id, name, public)
values ('templates', 'templates', true)
on conflict (id) do nothing;

-- ۲. دسترسی همگانی برای خواندن و دانلود فایل‌های قالب
create policy "Templates files are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'templates' );

-- ۳. دسترسی آپلود فایل برای کاربران تایید شده یا ادمین
create policy "Authenticated users can upload template files"
  on storage.objects for insert
  with check ( bucket_id = 'templates' );

create policy "Users can update and delete their own template files"
  on storage.objects for update
  using ( bucket_id = 'templates' );

create policy "Users can delete template files"
  on storage.objects for delete
  using ( bucket_id = 'templates' );

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

-- ۶. فعال‌سازی امنیت سطح سطر (Row Level Security - RLS)
alter table public.profiles enable row level security;
alter table public.templates enable row level security;

-- ۷. قوانین دسترسی جدول قالب‌ها
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

-- ۸. قوانین دسترسی جدول پروفایل‌ها
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

-- ۹. تریگر برای ساخت خودکار پروفایل هنگام ثبت‌نام کاربر در Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- اولین کاربری که ثبت نام کند، به صورت خودکار مدیر کل (admin) می‌شود!
  select count(*) = 0 into is_first_user from public.profiles;

  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first_user then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- اتصال تریگر به جدول کاربران
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
