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

// Zod schemas for input validation
const IdField = z.string().regex(/^[a-zA-Z0-9_-]+$/, "ID must be alphanumeric with dashes/underscores");

const ListChannelsInput = z.object({ workspace_id: IdField });
const GetMessagesInput = z.object({ channel_id: IdField, limit: z.number().int().positive().max(100).optional() });
const SendMessageInput = z.object({ channel_id: IdField, content: z.string().min(1).max(10000) });
const ListTasksInput = z.object({ workspace_id: IdField, status: z.enum(["todo", "in_progress", "review", "done"]).optional() });
const SearchMessagesInput = z.object({ query: z.string().min(1).max(500), limit: z.number().int().positive().max(100).optional() });
const EditMessageInput = z.object({ message_id: IdField, content: z.string().min(1).max(10000) });
const GetThreadInput = z.object({ message_id: IdField });
const ReplyThreadInput = z.object({ message_id: IdField, channel_id: IdField, content: z.string().min(1).max(10000) });
const ListNotificationsInput = z.object({ unread_only: z.boolean().optional(), limit: z.number().int().positive().max(100).optional() });
const MarkNotificationReadInput = z.object({ notification_id: IdField });
const InstallIntegrationInput = z.object({ workspace_id: IdField, integration_id: IdField, config: z.string().optional() });

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
    {
      name: "edit_message",
      description: "Edit an existing message",
      inputSchema: {
        type: "object",
        properties: {
          message_id: { type: "string", description: "Message ID" },
          content: { type: "string", description: "New message content" },
        },
        required: ["message_id", "content"],
      },
    },
    {
      name: "get_thread",
      description: "Get a message thread (parent + replies)",
      inputSchema: {
        type: "object",
        properties: {
          message_id: { type: "string", description: "Parent message ID" },
        },
        required: ["message_id"],
      },
    },
    {
      name: "reply_thread",
      description: "Reply to a message thread",
      inputSchema: {
        type: "object",
        properties: {
          message_id: { type: "string", description: "Parent message ID" },
          channel_id: { type: "string", description: "Channel ID" },
          content: { type: "string", description: "Reply content" },
        },
        required: ["message_id", "channel_id", "content"],
      },
    },
    {
      name: "list_notifications",
      description: "List notifications for the current user",
      inputSchema: {
        type: "object",
        properties: {
          unread_only: { type: "boolean", description: "Only unread notifications" },
          limit: { type: "number", description: "Max notifications (default 50)" },
        },
      },
    },
    {
      name: "mark_notification_read",
      description: "Mark a notification as read",
      inputSchema: {
        type: "object",
        properties: {
          notification_id: { type: "string", description: "Notification ID" },
        },
        required: ["notification_id"],
      },
    },
    {
      name: "mark_all_notifications_read",
      description: "Mark all notifications as read",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_integrations",
      description: "List available integrations",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "list_workspace_integrations",
      description: "List installed integrations in a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
      },
    },
    {
      name: "install_integration",
      description: "Install an integration in a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
          integration_id: { type: "string", description: "Integration ID" },
          config: { type: "string", description: "JSON config" },
        },
        required: ["workspace_id", "integration_id"],
      },
    },
    {
      name: "list_calls",
      description: "List recent calls",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max results (default 20)" },
        },
      },
    },
    {
      name: "list_workflows",
      description: "List workflows in a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
      },
    },
    {
      name: "trigger_workflow",
      description: "Manually trigger a workflow",
      inputSchema: {
        type: "object",
        properties: {
          workflow_id: { type: "string", description: "Workflow ID" },
          data: { type: "string", description: "JSON trigger data" },
        },
        required: ["workflow_id"],
      },
    },
    {
      name: "get_public_keys",
      description: "Get public keys for a member (for E2EE key exchange)",
      inputSchema: {
        type: "object",
        properties: {
          member_id: { type: "string", description: "Member ID" },
          key_type: { type: "string", description: "Key type: identity|signed_pre|one_time" },
        },
        required: ["member_id", "key_type"],
      },
    },
    {
      name: "get_billing",
      description: "Get billing status and plan limits for a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
      },
    },
    {
      name: "get_usage",
      description: "Get usage metrics for a workspace",
      inputSchema: {
        type: "object",
        properties: {
          workspace_id: { type: "string", description: "Workspace ID" },
        },
        required: ["workspace_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_workspaces": {
        const data = await larkApi("GET", "/v1/workspaces");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_channels": {
        const { workspace_id } = ListChannelsInput.parse(args);
        const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspace_id)}/channels`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_messages": {
        const { channel_id, limit } = GetMessagesInput.parse(args);
        const path = limit
          ? `/v1/channels/${encodeURIComponent(channel_id)}/messages?limit=${limit}`
          : `/v1/channels/${encodeURIComponent(channel_id)}/messages`;
        const data = await larkApi("GET", path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "send_message": {
        const { channel_id, content } = SendMessageInput.parse(args);
        const data = await larkApi("POST", `/v1/channels/${encodeURIComponent(channel_id)}/messages`, { content });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_tasks": {
        const { workspace_id, status } = ListTasksInput.parse(args);
        let path = `/v1/workspaces/${encodeURIComponent(workspace_id)}/tasks`;
        if (status) path += `?status=${encodeURIComponent(status)}`;
        const data = await larkApi("GET", path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "search_messages": {
        const { query, limit } = SearchMessagesInput.parse(args);
        let path = `/v1/search?q=${encodeURIComponent(query)}`;
        if (limit) path += `&limit=${limit}`;
        const data = await larkApi("GET", path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "edit_message": {
        const { message_id, content } = EditMessageInput.parse(args);
        const data = await larkApi("PATCH", `/v1/messages/${encodeURIComponent(message_id)}`, { content });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_thread": {
        const { message_id } = GetThreadInput.parse(args);
        const data = await larkApi("GET", `/v1/messages/${encodeURIComponent(message_id)}/thread`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "reply_thread": {
        const { message_id, channel_id, content } = ReplyThreadInput.parse(args);
        const data = await larkApi("POST", `/v1/channels/${encodeURIComponent(channel_id)}/messages`, {
          content,
          thread_id: message_id,
        });
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_notifications": {
        const { unread_only, limit } = ListNotificationsInput.parse(args);
        let path = "/v1/notifications";
        const params = new URLSearchParams();
        if (unread_only) params.set("unread", "true");
        if (limit) params.set("limit", String(limit));
        const qs = params.toString();
        if (qs) path += `?${qs}`;
        const data = await larkApi("GET", path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "mark_notification_read": {
        const { notification_id } = MarkNotificationReadInput.parse(args);
        await larkApi("PATCH", `/v1/notifications/${encodeURIComponent(notification_id)}/read`);
        return { content: [{ type: "text", text: "Notification marked as read" }] };
      }

      case "mark_all_notifications_read": {
        await larkApi("POST", "/v1/notifications/mark-all-read");
        return { content: [{ type: "text", text: "All notifications marked as read" }] };
      }

      case "list_integrations": {
        const data = await larkApi("GET", "/v1/integrations");
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_workspace_integrations": {
        const { workspace_id } = ListChannelsInput.parse(args);
        const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspace_id)}/integrations`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "install_integration": {
        const { workspace_id, integration_id, config } = InstallIntegrationInput.parse(args);
        const body: Record<string, string> = { integration_id };
        if (config) body.config = config;
        const data = await larkApi("POST", `/v1/workspaces/${encodeURIComponent(workspace_id)}/integrations`, body);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_calls": {
        const { limit } = SearchMessagesInput.parse(args);
        let path = "/v1/calls";
        if (limit) path += `?limit=${limit}`;
        const data = await larkApi("GET", path);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "list_workflows": {
        const { workspace_id } = ListChannelsInput.parse(args);
        const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspace_id)}/workflows`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "trigger_workflow": {
        const { workflow_id, data } = z.object({ workflow_id: IdField, data: z.string().optional() }).parse(args);
        const body = data ? JSON.parse(data) : {};
        const result = await larkApi("POST", `/v1/workflows/${encodeURIComponent(workflow_id)}/trigger`, body);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "get_public_keys": {
        const { member_id, key_type } = z.object({ member_id: IdField, key_type: z.enum(["identity", "signed_pre", "one_time"]) }).parse(args);
        const data = await larkApi("GET", `/v1/members/${encodeURIComponent(member_id)}/keys?type=${key_type}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_billing": {
        const { workspace_id } = ListChannelsInput.parse(args);
        const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspace_id)}/billing`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_usage": {
        const { workspace_id } = ListChannelsInput.parse(args);
        const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspace_id)}/usage`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { isError: true, content: [{ type: "text", text: `Invalid input: ${e.errors.map((err) => err.message).join(", ")}` }] };
    }
    return { isError: true, content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "unknown error"}` }] };
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
  try {
    if (uri === "lark://workspaces") {
      const data = await larkApi("GET", "/v1/workspaces");
      return {
        contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
      };
    }
    // Dynamic: lark://workspaces/{id}/channels
    const chMatch = uri.match(/^lark:\/\/workspaces\/([^/]+)\/channels$/);
    if (chMatch) {
      const workspaceId = chMatch[1];
      IdField.parse(workspaceId);
      const data = await larkApi("GET", `/v1/workspaces/${encodeURIComponent(workspaceId)}/channels`);
      return {
        contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
      };
    }
    throw new Error(`Unknown resource: ${uri}`);
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new Error(`Invalid resource ID: ${e.errors.map((err) => err.message).join(", ")}`);
    }
    throw e;
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("lark-mcp server running on stdio");

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
