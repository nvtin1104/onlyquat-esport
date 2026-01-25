# AGENTS.md — Guide for AI Coding Agents

This file provides context and instructions for AI agents (Cursor, GitHub Copilot, etc.) when working with the **onlyquat-esport** codebase.

---

## Project Overview

- **Name:** onlyquat-esport
- **Description:** Esports-related project.
- **Status:** New project, currently in the initialization phase.

---

## Development Environment

### Requirements

- _(Update once tech stack is defined: Node.js, Python, etc.)_

### Installation

```bash
# Example — update according to actual dependencies
# npm install
# pip install -r requirements.txt
```

### Running the Project

```bash
# Example — update according to project structure
# npm run dev
# python main.py
```

### Build

```bash
# npm run build
# cargo build --release
```

---

## Testing

### Running Tests

```bash
# npm test
# pytest
# cargo test
```

### Linting / Formatting

```bash
# npm run lint
# black . && ruff check .
```

---

## Code Conventions

- **Language:** _(Add when applicable: TypeScript, Python, Rust, etc.)_
- **Formatting:** Follow the style guide of the language/framework in use.
- **Naming:** Clear and consistent; avoid obscure abbreviations.
- **Commits:** Short, descriptive messages (consider conventional commits if the project adopts them).

---

## Project Structure

```
onlyquat-esport/
├── .gitignore
├── AGENTS.md          # This file
├── README.md
└── (source directories to be added later)
```

_(Update when a concrete structure exists: `src/`, `app/`, `tests/`, etc.)_

---

## Contribution / PR Requirements

- New code must pass lint and tests (when available).
- Update documentation (README, AGENTS.md) when changing setup or workflows.
- Do not commit sensitive files (keys, secrets, tokens); use environment variables or gitignored config files.

---

## Notes for AI Agents

- Always read `README.md` and `AGENTS.md` before modifying code.
- Prefer simple, readable code; avoid over-engineering while the project is small.
- When adding new dependencies, update the manifest (e.g. `package.json`, `requirements.txt`) and note it in commits/PRs.
- If tech stack or conventions are unclear, ask the user instead of guessing.

---

_Update `AGENTS.md` whenever setup, tooling, or project conventions change._
