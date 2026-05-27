# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-27

### Added

- Initial release of Lark MCP Server
- MCP server with stdio transport
- 21 tools for interacting with the Lark platform:
  - `list_workspaces` -- List all workspaces
  - `list_channels` -- List channels in a workspace
  - `get_messages` -- Get messages from a channel
  - `send_message` -- Send a message to a channel
  - `edit_message` -- Edit an existing message
  - `search_messages` -- Search messages across channels
  - `get_thread` -- Get a message thread
  - `reply_thread` -- Reply to a message thread
  - `list_tasks` -- List tasks in a workspace
  - `list_notifications` -- List notifications
  - `mark_notification_read` -- Mark a notification as read
  - `mark_all_notifications_read` -- Mark all notifications as read
  - `list_calls` -- List recent calls
  - `list_workflows` -- List workflows in a workspace
  - `trigger_workflow` -- Trigger a workflow
  - `list_integrations` -- List available integrations
  - `list_workspace_integrations` -- List workspace integrations
  - `install_integration` -- Install an integration
  - `get_billing` -- Get billing status
  - `get_usage` -- Get usage metrics
  - `get_public_keys` -- Get public keys for E2EE
- MCP resources for workspaces and channels
- Zod-based input validation for all tools
- Environment variable configuration (`LARK_API_URL`, `LARK_API_KEY`)
