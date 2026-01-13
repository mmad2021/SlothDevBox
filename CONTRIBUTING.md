# Contributing to SlothDevBox

First off, thanks for taking the time to contribute! 🎉

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Describe the bug and steps to reproduce
- Include your environment (OS, Bun version, etc.)

### Suggesting Enhancements

- Use the GitHub issue tracker
- Clearly describe the feature and use case
- Provide examples if possible

### Pull Requests

1. Fork the repo and create your branch from `master`
2. If you've added code, add tests if applicable
3. Ensure the code builds and runs
4. Make sure your code follows the existing style
5. Write clear commit messages
6. Open a pull request!

## Development Setup

```bash
# Install dependencies
bun install

# Setup database
bun run db:setup

# Start dev servers
bun run dev
```

## Project Structure

```
apps/
  api/     - Express backend
  ui/      - React frontend  
  worker/  - Task executor
packages/
  shared/  - Shared types
```

## Coding Guidelines

- Use TypeScript
- Follow existing code style
- Keep it simple and maintainable
- Comment complex logic
- No arbitrary command execution (security)

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

## Questions?

Feel free to open an issue for any questions.

Thanks! 🦥
