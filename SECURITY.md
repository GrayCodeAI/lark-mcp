# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes |
| < 0.1   | No |

## Reporting a Vulnerability

If you discover a security vulnerability in Lark MCP Server, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email **security@graycodeai.com** with:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fixes (optional)

You should receive a response within 48 hours acknowledging receipt. We will work with you to understand the issue and coordinate a fix and disclosure timeline.

## Security Considerations

- **API Keys**: Never commit API keys or tokens to version control. Use environment variables.
- **Input Validation**: All tool inputs are validated with Zod schemas before being sent to the Lark API.
- **Transport**: The MCP server communicates over stdio, not HTTP. Ensure your MCP client environment is trusted.
- **Network**: The server makes outbound HTTP requests to the Lark API. Ensure `LARK_API_URL` points to a trusted endpoint.

## Disclosure Policy

Once a fix is ready, we will:

1. Release a patched version
2. Publish a security advisory on GitHub
3. Credit the reporter (unless they prefer anonymity)

Thank you for helping keep Lark MCP Server secure.
