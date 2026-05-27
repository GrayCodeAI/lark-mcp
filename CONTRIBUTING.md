# Contributing to Lark MCP Server

Thank you for your interest in contributing to Lark MCP Server. This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/lark-mcp.git
   cd lark-mcp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in the `src/` directory
2. Build and verify your changes compile:
   ```bash
   npm run build
   ```
3. Test your changes with a running Lark instance
4. Commit your changes with a clear, descriptive message

## Pull Request Process

1. Ensure your code compiles without errors (`npm run build`)
2. Update documentation if your changes affect the public API
3. Open a pull request against the `main` branch
4. Fill out the PR template completely
5. Request a review from a maintainer

## Code Style

- TypeScript with strict mode enabled
- ESM modules (`type: "module"` in package.json)
- Use Zod for all input validation
- All Lark API calls go through the `larkApi()` helper
- Tools return text content blocks; resources return JSON content

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for channel archiving
fix: handle null response from notifications endpoint
docs: update README with new tool parameters
chore: bump MCP SDK to 1.1.0
```

## Reporting Issues

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) for bugs
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) for new features
- Include reproduction steps, expected behavior, and actual behavior

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
