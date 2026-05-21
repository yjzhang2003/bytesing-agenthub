# Supabase Migration Checks

Run these checks after applying migrations to a Supabase database:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'workspaces',
    'runtime_devices',
    'conversations',
    'conversation_participants',
    'messages',
    'agents',
    'providers',
    'runs',
    'permissions',
    'artifacts',
    'audit_logs'
  )
order by tablename;

select tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename in ('runtime_devices', 'messages', 'runs', 'permissions', 'artifacts')
order by tablename;
```

Expected result: all user-owned tables exist, each has an owner-scoped RLS policy, and realtime publication includes runtime devices, messages, runs, permissions, and artifacts.

