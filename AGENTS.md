# CLAUDE.md — lark-mcp

## Build & Run

```bash
npm install
npm run build
node dist/index.js
```

## Structure

- `src/index.ts` — Single-file MCP server with all tools and resources

## Environment Variables

- `LARK_API` — Lark daemon URL (default: `http://127.0.0.1:4001`)
- `LARK_TOKEN` — Required API key or JWT

## Conventions

- TypeScript with ESM modules
- MCP SDK for server framework
- All Lark API calls go through `larkApi()` helper
- Tools return text content blocks
- Resources return JSON content
