# Lark MCP Server

> The Model Context Protocol bridge between AI agents and the Lark messaging platform.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-green?logo=modelcontextprotocol&logoColor=white)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js&logoColor=white)](https://nodejs.org/)

Lark MCP Server is a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the [Lark](https://github.com/graycodeai/lark) agent-native messaging platform as structured tools for AI agents. It runs over stdio transport, allowing any MCP-compatible client -- Claude Desktop, Claude Code, Cursor, Windsurf, and others -- to read channels, send messages, manage workflows, handle notifications, and interact with every layer of the Lark platform through a single, typed interface.

## Features

- **Messaging** -- Read, send, edit, and search messages across channels
- **Channels & Workspaces** -- List and browse workspace structure
- **Threads** -- Read and reply to threaded conversations
- **Notifications** -- List, filter, and mark notifications as read
- **Tasks** -- List and filter tasks by status
- **Calls** -- View recent call history
- **Workflows** -- List and trigger workspace workflows
- **Integrations** -- Browse, list, and install workspace integrations
- **Billing & Usage** -- Check plan limits and usage metrics
- **E2EE Key Exchange** -- Retrieve public keys for end-to-end encryption

## Installation

```bash
npm install lark-mcp
```

Or run directly with npx:

```bash
npx lark-mcp
```

## Configuration

The server requires two environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LARK_API_URL` | No | `http://127.0.0.1:4001` | URL of the Lark API server |
| `LARK_API_KEY` | **Yes** | -- | API key or JWT token for authentication |

## Usage

### Claude Desktop

Add the following to your Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lark": {
      "command": "npx",
      "args": ["lark-mcp"],
      "env": {
        "LARK_API_URL": "http://127.0.0.1:4001",
        "LARK_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "lark": {
      "command": "npx",
      "args": ["lark-mcp"],
      "env": {
        "LARK_API_URL": "http://127.0.0.1:4001",
        "LARK_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Building from Source

```bash
git clone https://github.com/graycodeai/lark-mcp.git
cd lark-mcp
npm install
npm run build
```

Then use the built binary directly:

```json
{
  "mcpServers": {
    "lark": {
      "command": "node",
      "args": ["/path/to/lark-mcp/dist/index.js"],
      "env": {
        "LARK_API_URL": "http://127.0.0.1:4001",
        "LARK_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `list_workspaces` | List all workspaces | -- |
| `list_channels` | List channels in a workspace | `workspace_id` |
| `get_messages` | Get messages from a channel | `channel_id`, `limit?` |
| `send_message` | Send a message to a channel | `channel_id`, `content` |
| `edit_message` | Edit an existing message | `message_id`, `content` |
| `search_messages` | Search messages across channels | `query`, `limit?` |
| `get_thread` | Get a message thread (parent + replies) | `message_id` |
| `reply_thread` | Reply to a message thread | `message_id`, `channel_id`, `content` |
| `list_tasks` | List tasks in a workspace | `workspace_id`, `status?` |
| `list_notifications` | List notifications for the current user | `unread_only?`, `limit?` |
| `mark_notification_read` | Mark a notification as read | `notification_id` |
| `mark_all_notifications_read` | Mark all notifications as read | -- |
| `list_calls` | List recent calls | `limit?` |
| `list_workflows` | List workflows in a workspace | `workspace_id` |
| `trigger_workflow` | Manually trigger a workflow | `workflow_id`, `data?` |
| `list_integrations` | List available integrations | -- |
| `list_workspace_integrations` | List installed integrations in a workspace | `workspace_id` |
| `install_integration` | Install an integration in a workspace | `workspace_id`, `integration_id`, `config?` |
| `get_billing` | Get billing status and plan limits | `workspace_id` |
| `get_usage` | Get usage metrics for a workspace | `workspace_id` |
| `get_public_keys` | Get public keys for E2EE key exchange | `member_id`, `key_type` |

## Available Resources

| Resource | Description |
|----------|-------------|
| `lark://workspaces` | All workspaces (JSON) |
| `lark://workspaces/{id}/channels` | Channels in a workspace (JSON) |

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (watch)
npm run dev

# Start the server
npm start
```

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

For security vulnerabilities, please see [SECURITY.md](SECURITY.md).

## License

MIT -- see [LICENSE](LICENSE) for details.
