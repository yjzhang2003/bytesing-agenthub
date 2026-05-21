# Claude Code Adapter

This package adapts AgentHub provider runs to the local `claude` CLI.

## Prerequisites

- Claude Code is installed on the Desktop Runtime machine.
- The user has already authenticated Claude Code locally.
- `AGENTHUB_CLAUDE_CODE_BIN` points to the executable name or absolute path. The default is `claude`.

## Execution Model

The adapter starts Claude Code in print/headless mode with `claude -p <prompt>` from the workspace path provided by Desktop Runtime. It streams stdout into AgentHub message delta events and maps process lifecycle changes into provider-normalized run status events.

The adapter does not own product permission policy. Permission gates live in AgentHub Runtime and Control Plane so this package can be replaced by another provider adapter without changing the platform model.

