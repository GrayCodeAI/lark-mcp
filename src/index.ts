import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const LARK_API = process.env.LARK_API || "http://127.0.0.1:4001";
const LARK_TOKEN = process.env.LARK_TOKEN || "";

if (!LARK_TOKEN) {
  console.error("error: LARK_TOKEN environment variable is required");
  process.exit(1);
}

async function larkApi(method: string, path: string, body?: unknown) {
  const res = await fetch(`${LARK_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${LARK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lark API error ${res.status}: ${text}`);
  }
  return res.json();
}

const server = new Server(
  { name: "lark-mcp", version: "0.1.0" },
  { capabilities: { resources: {}, tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_workspaces",
      description: "List all workspaces",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_channels",
      description: "List channels in a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
      },
    },
    {
      name: "get_messages",
      description: "Get messages from a channel",
      inputSchema: {
        type: "object",
        properties: {
          channel_id: { type: "string", description: "Channel ID" },
          limit: { type: "number", description: "Max messages (default 20)" },
        },
        required: ["channel_id"],
      },
    },
    {
      name: "send_message",
      description: "Send a message to a channel",
      inputSchema: {
        type: "object",
        properties: {
          channel_id: { type: "string", description: "Channel ID" },
          content: { type: "string", description: "Message content" },
        },
        required: ["channel_id", "content"],
      },
    },
    {
      name: "list_tasks",
      description: "List tasks in a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
          status: {
            type: "string",
            description: "Filter: todo|in_progress|review|done",
          },
        },
        required: ["workspace_id"],
      },
    },
    {
      name: "search_messages",
      description: "Search messages across channels",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          limit: { type: "number", description: "Max results (default 20)" },
        },
        required: ["query"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_workspaces": {
      const data = await larkApi("GET", "/v1/workspaces");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "list_channels": {
      const { workspace_id } = args as { workspace_id: string };
      const data = await larkApi("GET", `/v1/workspaces/${workspace_id}/channels`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "get_messages": {
      const { channel_id, limit } = args as { channel_id: string; limit?: number };
      const path = limit ? `/v1/channels/${channel_id}/messages?limit=${limit}` : `/v1/channels/${channel_id}/messages`;
      const data = await larkApi("GET", path);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "send_message": {
      const { channel_id, content } = args as { channel_id: string; content: string };
      const data = await larkApi("POST", `/v1/channels/${channel_id}/messages`, { content });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "list_tasks": {
      const { workspace_id, status } = args as { workspace_id: string; status?: string };
      let path = `/v1/workspaces/${workspace_id}/tasks`;
      if (status) path += `?status=${status}`;
      const data = await larkApi("GET", path);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "search_messages": {
      const { query, limit } = args as { query: string; limit?: number };
      let path = `/v1/search?q=${encodeURIComponent(query)}`;
      if (limit) path += `&limit=${limit}`;
      const data = await larkApi("GET", path);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "lark://workspaces",
      name: "All Workspaces",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  if (uri === "lark://workspaces") {
    const data = await larkApi("GET", "/v1/workspaces");
    return {
      contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
    };
  }
  // Dynamic: lark://workspaces/{id}/channels
  const chMatch = uri.match(/^lark:\/\/workspaces\/([^/]+)\/channels$/);
  if (chMatch) {
    const data = await larkApi("GET", `/v1/workspaces/${chMatch[1]}/channels`);
    return {
      contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
    };
  }
  throw new Error(`Unknown resource: ${uri}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("lark-mcp server running on stdio");
