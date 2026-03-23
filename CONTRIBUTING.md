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
2. **Start local stack with Docker**: `docker compose up -d --build`
3. **Code** your changes following the existing patterns
4. **Test** your changes locally (frontend at `http://localhost:5173`, backend at `http://localhost:5000`)
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

EduNation is Docker-first for local development.

### Start

```bash
docker compose up -d --build
```

Note: For local Docker development, do not add or edit backend .env.
The required development variables are already defined in docker-compose.yml (including NODE_ENV=development).

### Services/Containers

- `frontend` (`edunation-frontend`)
- `backend` (`edunation-backend`)
- `postgres` (`edunation-postgres`)
- `redis` (`edunation-redis`)
- `db-init` (`edunation-db-init`, one-time schema init)

### Helpful commands

```bash
docker compose ps
docker compose logs -f backend
docker compose down
```

See the [README](./README.md) for full setup details.

## Questions?

Open a [Discussion](../../discussions) or reach out via Issues. We're happy to help!
