# Lark MCP Server

Model Context Protocol (MCP) server that bridges AI agents to the Lark messaging platform. Runs over stdio transport, allowing MCP-compatible AI clients to interact with Lark workspaces.

## Setup

```bash
npm install
npm run build
```

## Configuration

Set environment variables:

```bash
export LARK_API=http://127.0.0.1:4001    # Lark daemon URL
export LARK_TOKEN=your-api-key            # Required: API key or JWT
```

## Claude Desktop Configuration

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "lark": {
      "command": "node",
      "args": ["path/to/lark-mcp/dist/index.js"],
      "env": {
        "LARK_API": "http://127.0.0.1:4001",
        "LARK_TOKEN": "your-api-key"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_workspaces` | List all workspaces |
| `list_channels` | List channels in a workspace |
| `get_messages` | Get messages from a channel |
| `send_message` | Send a message to a channel |
| `list_tasks` | List tasks in a workspace |
| `search_messages` | Search messages across channels |

## Available Resources

| Resource | Description |
|----------|-------------|
| `lark://workspaces` | All workspaces (JSON) |
| `lark://workspaces/{id}/channels` | Channels in a workspace |

## Development

```bash
npm run build    # Compile TypeScript
```
