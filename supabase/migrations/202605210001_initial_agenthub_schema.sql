create extension if not exists "pgcrypto";

create type runtime_kind as enum ('local', 'cloud');
create type runtime_device_status as enum ('online', 'offline', 'degraded', 'active-running');
create type provider_kind as enum ('claude-code-local-process', 'mock', 'codex', 'opencode', 'custom');
create type agent_role as enum ('orchestrator', 'worker');
create type conversation_kind as enum ('single-agent', 'group');
create type message_author_kind as enum ('user', 'agent', 'system');
create type run_status as enum (
  'queued',
  'running',
  'streaming',
  'blocked',
  'cancelling',
  'cancelled',
  'completed',
  'failed'
);
create type permission_action_kind as enum (
  'file.read',
  'file.write',
  'file.delete',
  'command.run',
  'network.access',
  'deploy.publish'
);
create type permission_risk as enum ('low', 'medium', 'high');
create type permission_status as enum (
  'pending',
  'allowed-once',
  'denied',
  'expired',
  'blocked',
  'completed'
);
create type artifact_type as enum ('code', 'diff', 'file', 'web-preview', 'deployment', 'document');

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  runtime_kind runtime_kind not null default 'local',
  runtime_device_id uuid,
  local_path text,
  repo_url text,
  default_branch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table runtime_devices (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  platform text not null check (platform in ('macos', 'windows', 'linux', 'cloud')),
  app_version text not null,
  status runtime_device_status not null default 'offline',
  capabilities text[] not null default '{}',
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table workspaces
  add constraint workspaces_runtime_device_fk
  foreign key (runtime_device_id) references runtime_devices(id) on delete set null;

create table providers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  kind provider_kind not null,
  display_name text not null,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete restrict,
  display_name text not null,
  role agent_role not null default 'worker',
  system_prompt text not null,
  capability_tags text[] not null default '{}',
  policy jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kind conversation_kind not null,
  title text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversation_participants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  agent_id uuid references agents(id) on delete cascade,
  participant_kind text not null check (participant_kind in ('user', 'agent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint participant_has_identity check (
    (participant_kind = 'user' and agent_id is null)
    or (participant_kind = 'agent' and agent_id is not null)
  )
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  author_kind message_author_kind not null,
  author_id uuid not null,
  parts jsonb not null default '[]',
  reply_to_message_id uuid references messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete restrict,
  plan_id uuid,
  status run_status not null default 'queued',
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  run_id uuid not null references runs(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete restrict,
  action_kind permission_action_kind not null,
  risk permission_risk not null,
  status permission_status not null default 'pending',
  summary text not null,
  command text,
  paths text[] not null default '{}',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  run_id uuid not null references runs(id) on delete cascade,
  type artifact_type not null,
  title text not null,
  summary text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  run_id uuid references runs(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspaces_owner_idx on workspaces(owner_user_id);
create index runtime_devices_owner_status_idx on runtime_devices(owner_user_id, status);
create index providers_owner_idx on providers(owner_user_id);
create index agents_workspace_idx on agents(owner_user_id, workspace_id);
create index conversations_workspace_updated_idx on conversations(owner_user_id, workspace_id, updated_at desc);
create index conversation_participants_conversation_idx on conversation_participants(owner_user_id, conversation_id);
create index messages_conversation_created_idx on messages(owner_user_id, conversation_id, created_at);
create index runs_workspace_status_idx on runs(owner_user_id, workspace_id, status);
create index permissions_workspace_status_idx on permissions(owner_user_id, workspace_id, status);
create index artifacts_run_idx on artifacts(owner_user_id, run_id);
create index audit_logs_owner_created_idx on audit_logs(owner_user_id, created_at desc);

alter table workspaces enable row level security;
alter table runtime_devices enable row level security;
alter table providers enable row level security;
alter table agents enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table runs enable row level security;
alter table permissions enable row level security;
alter table artifacts enable row level security;
alter table audit_logs enable row level security;

create policy user_owned_workspaces on workspaces
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_runtime_devices on runtime_devices
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_providers on providers
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_agents on agents
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_conversations on conversations
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_conversation_participants on conversation_participants
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_messages on messages
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_runs on runs
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_permissions on permissions
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_artifacts on artifacts
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_owned_audit_logs on audit_logs
  for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

alter publication supabase_realtime add table runtime_devices;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table runs;
alter publication supabase_realtime add table permissions;
alter publication supabase_realtime add table artifacts;

