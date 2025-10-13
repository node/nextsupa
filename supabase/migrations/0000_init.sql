-- Create Profiles Table
-- This table will store public user data.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone,

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create Workspaces Table
create table public.workspaces (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  owner_id uuid not null references public.profiles on delete cascade,

  primary key (id)
);

alter table public.workspaces
  enable row level security;

-- Create Workspace Members Junction Table
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  role text not null default 'member', -- e.g., 'owner', 'admin', 'member'
  joined_at timestamp with time zone not null default now(),

  primary key (workspace_id, user_id)
);

alter table public.workspace_members
  enable row level security;

-- RLS policies for workspaces and members
create policy "Users can view workspaces they are a member of." on public.workspaces
  for select using (exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = workspaces.id and workspace_members.user_id = auth.uid()
  ));

create policy "Users can create workspaces." on public.workspaces
  for insert with check (auth.uid() = owner_id);

create policy "Workspace owners can update their own workspaces." on public.workspaces
  for update using (auth.uid() = owner_id);

create policy "Users can view their own workspace memberships." on public.workspace_members
  for select using (auth.uid() = user_id);

create policy "Workspace owners can add members." on public.workspace_members
  for insert with check (exists (
    select 1 from public.workspaces
    where workspaces.id = workspace_members.workspace_id and workspaces.owner_id = auth.uid()
  ));

-- Create Projects Table
create table public.projects (
  id uuid not null default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  author_id uuid not null references public.profiles on delete cascade,
  name text not null,
  description text,
  icon_url text,
  website_url text,
  repo_url text,
  screenshots jsonb,
  use_cases text,
  visibility text not null default 'private', -- 'private', 'workspace', 'public'
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone,

  primary key (id)
);

alter table public.projects
  enable row level security;

-- RLS for projects
create policy "Public projects are viewable by everyone." on public.projects
  for select using (visibility = 'public');

create policy "Workspace members can view workspace-visible projects." on public.projects
  for select using (
    visibility = 'workspace' and exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = projects.workspace_id and workspace_members.user_id = auth.uid()
    )
  );

create policy "Project authors can view their private projects." on public.projects
  for select using (
    visibility = 'private' and auth.uid() = author_id
  );

create policy "Workspace members can create projects." on public.projects
  for insert with check (exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = projects.workspace_id and workspace_members.user_id = auth.uid()
  ));

create policy "Project authors can update their own projects." on public.projects
  for update using (auth.uid() = author_id);


-- Social Features Tables
create table public.project_likes (
  project_id uuid not null references public.projects on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamp with time zone not null default now(),

  primary key (project_id, user_id)
);

create table public.project_comments (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  content text not null,
  created_at timestamp with time zone not null default now(),

  primary key (id)
);

create table public.project_follows (
  project_id uuid not null references public.projects on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  created_at timestamp with time zone not null default now(),

  primary key (project_id, user_id)
);

-- RLS for social features
alter table public.project_likes enable row level security;
alter table public.project_comments enable row level security;
alter table public.project_follows enable row level security;

-- Allow full access to social features for authenticated users for now
-- RLS policies for project_likes
create policy "Users can view all likes." on public.project_likes
  for select using (true);

create policy "Users can insert their own likes." on public.project_likes
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on public.project_likes
  for delete using (auth.uid() = user_id);

-- RLS policies for project_comments
create policy "Users can view all comments." on public.project_comments
  for select using (true);

create policy "Users can insert their own comments." on public.project_comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments." on public.project_comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments." on public.project_comments
  for delete using (auth.uid() = user_id);

-- RLS policies for project_follows
create policy "Users can view all follows." on public.project_follows
  for select using (true);

create policy "Users can insert their own follows." on public.project_follows
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own follows." on public.project_follows
  for delete using (auth.uid() = user_id);