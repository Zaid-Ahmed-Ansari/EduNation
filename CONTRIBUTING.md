# Contributing to EduNation

First off, thank you for considering contributing to EduNation! 🌍

## How Can I Contribute?

### 🐛 Reporting Bugs

- Use the [GitHub Issues](../../issues) tab
- Include steps to reproduce, expected vs. actual behavior
- Add screenshots if applicable
- Mention your OS, browser, and Node.js version

### 💡 Suggesting Features

- Open an issue with the `enhancement` label
- Describe the use case and why it would benefit the project
- If possible, include mockups or references

### 🔧 Pull Requests

1. **Fork** the repo and create your branch from `main`
2. **Install** dependencies: `npm install` in both `frontend/` and `backend/`
3. **Code** your changes following the existing patterns
4. **Test** your changes locally (`npm run dev` in both directories)
5. **Commit** with clear, descriptive messages (e.g., `feat: add CO2 trend chart`)
6. **Push** to your fork and open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix   | Use case                        |
|----------|---------------------------------|
| `feat:`  | New feature                     |
| `fix:`   | Bug fix                         |
| `docs:`  | Documentation only              |
| `style:` | Formatting, no logic change     |
| `refactor:` | Code restructuring           |
| `perf:`  | Performance improvement         |
| `test:`  | Adding or fixing tests          |
| `chore:` | Build process, tooling          |

### Code Style

- **TypeScript** everywhere — no `any` unless absolutely necessary
- **Functional components** with hooks in React
- **Consistent naming** — `camelCase` for variables, `PascalCase` for components
- Use the existing project structure and patterns

## Development Setup

See the [README](./README.md) for full setup instructions.

## Questions?

Open a [Discussion](../../discussions) or reach out via Issues. We're happy to help!
