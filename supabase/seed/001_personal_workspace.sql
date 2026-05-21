-- Replace the owner_user_id value with a real auth.users id before running manually.
do $$
declare
  user_id uuid := '00000000-0000-0000-0000-000000000000';
  device_id uuid;
  workspace_id uuid;
  provider_id uuid;
  orchestrator_id uuid;
  implementer_id uuid;
  reviewer_id uuid;
begin
  insert into runtime_devices (owner_user_id, display_name, platform, app_version, status, capabilities)
  values (
    user_id,
    'Local Mac Desktop Runtime',
    'macos',
    '0.1.0',
    'offline',
    array['claude-code-local-process', 'git-diff', 'permissions']
  )
  returning id into device_id;

  insert into workspaces (owner_user_id, name, runtime_kind, runtime_device_id, local_path, default_branch)
  values (user_id, 'AgentHub Demo Workspace', 'local', device_id, null, 'main')
  returning id into workspace_id;

  insert into providers (owner_user_id, kind, display_name, config)
  values (user_id, 'claude-code-local-process', 'Claude Code Local', '{"binaryPath":"claude"}')
  returning id into provider_id;

  insert into agents (
    owner_user_id,
    workspace_id,
    provider_id,
    display_name,
    role,
    system_prompt,
    capability_tags,
    policy
  )
  values
    (
      user_id,
      workspace_id,
      provider_id,
      'Orchestrator',
      'orchestrator',
      'Coordinate work by producing validated dispatch plans before worker execution.',
      array['planning', 'dispatch', 'summary'],
      '{"requiresPlanApproval":true}'
    )
  returning id into orchestrator_id;

  insert into agents (
    owner_user_id,
    workspace_id,
    provider_id,
    display_name,
    role,
    system_prompt,
    capability_tags,
    policy
  )
  values
    (
      user_id,
      workspace_id,
      provider_id,
      'Implementer',
      'worker',
      'Implement scoped code changes after permission gates are satisfied.',
      array['code', 'diff', 'workspace'],
      '{"requiresFileWritePermission":true}'
    )
  returning id into implementer_id;

  insert into agents (
    owner_user_id,
    workspace_id,
    provider_id,
    display_name,
    role,
    system_prompt,
    capability_tags,
    policy
  )
  values
    (
      user_id,
      workspace_id,
      provider_id,
      'Reviewer',
      'worker',
      'Review diffs, identify risks, and summarize follow-up actions.',
      array['review', 'diff', 'quality'],
      '{}'
    )
  returning id into reviewer_id;

  insert into conversations (owner_user_id, workspace_id, kind, title)
  values (user_id, workspace_id, 'group', 'AgentHub demo group chat');

  perform orchestrator_id;
  perform implementer_id;
  perform reviewer_id;
end $$;

