---
name: Rebuild README
allowed-tools: Bash, Read, Write
description: Generate a developer-focused README.md for the project or module
---

# Rebuild README

Follow the `Workflow` for the `FOLDER_PATH` then `Report` the completed work.

## Variables

FOLDER_PATH: $ARGUMENTS

## Workflow

If no `FOLDER_PATH` is provided, STOP immediately and ask the user to provide it.

Analyze the target directory and create a README.md that includes:

1. **Project Overview**
   - Brief description of what this project/module does
   - Key technologies and frameworks used
   - License information (if available)

2. **Getting Started**
   - Prerequisites (Node.js version, etc.)
   - Installation instructions
   - Environment setup (.env variables needed)
   - Quick start commands

3. **Architecture**
   - High-level architecture overview
   - Key components and their responsibilities
   - Data flow or request flow (if applicable)

4. **Development**
   - Available npm/yarn scripts with descriptions
   - Testing approach and commands
   - Linting and formatting setup
   - Build process

5. **Deployment**
   - Deployment environments (if applicable)
   - CI/CD pipeline overview
   - Production considerations

6. **API/Interface Documentation** (if applicable)
   - Endpoint documentation for services
   - Component props for libraries
   - CLI commands for tools

7. **Contributing**
   - Link to CONTEXT.md for active development context
   - Code style guidelines
   - PR process

8. **Troubleshooting**
   - Common issues and solutions
   - Debug commands
   - Logs location

The generated README should be professional, focused on onboarding developers, and avoid duplicating dynamic context from CONTEXT.md.

## Report

```markdown
# [Project Name]

[Brief description of what this project does and its purpose]

## 🚀 Getting Started

### Prerequisites
- Node.js >= [version]
- [Other requirements]

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file with:
```
KEY=value
```

### Quick Start
```bash
npm run dev
```

## Architecture

[High-level overview of the system architecture]

### Key Components
- **Component A**: [Purpose]
- **Component B**: [Purpose]

## Development

### Available Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run build` | Build for production |

### Testing
```bash
npm test
npm run test:coverage
```

## Deployment

[Deployment process and environments]

## API Documentation

[If applicable, document key APIs/interfaces]

## Contributing

For active development context and current work, see [CONTEXT.md](./CONTEXT.md)

## Troubleshooting

### Common Issues

**Issue**: [Description]
**Solution**: [How to fix]

## License

[License information]
```