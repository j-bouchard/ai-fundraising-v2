---
name: Analyze Codebase
allowed-tools: Bash, Read, Write
description: Generate a developer-focused codebase_analysis.md
---

# Analyze Codebase (Modular Templates)

Follow the `Workflow` for the `FOLDER_PATH` then `Report` the completed work.

## Variables

FOLDER_PATH: (to be provided by user)

## Workflow

If no `FOLDER_PATH` is provided, STOP immediately and ask the user to provide it.

### Step 1: Project Detection & Template Loading

First, analyze the target directory to detect project type and load appropriate templates:

1. **Scan for key indicator files** in the target directory
2. **Load base analysis template** from `.claude/templates/paz/acb/base.md`
3. **Load technology-specific templates** based on detection
4. **Merge templates** into comprehensive analysis structure

### Step 2: Technology Detection Logic

Detect project types by scanning for these files:
- **MCP Server**: `package.json` contains `@modelcontextprotocol/sdk`
- **Next.js**: `next.config.js` or `next.config.ts` exists
- **Cloudflare Worker**: `wrangler.toml` or `wrangler.jsonc` exists
- **React App**: `package.json` contains `react`
- **TypeScript**: `tsconfig.json` exists
- **Jest Testing**: `jest.config.js` or `jest.config.cjs` exists
- **iOS App**: `Package.swift` or `*.xcodeproj` exists
- **Python**: `requirements.txt` or `pyproject.toml` exists

### Step 3: Template Integration

For each detected technology, read the corresponding template file:

**Base Template**: Always include `.claude/templates/paz/acb/base.md`

**Technology Templates** (include if detected):
- MCP Server → `.claude/templates/paz/acb/mcp-server.md`
- Next.js → `.claude/templates/paz/acb/nextjs.md`
- Cloudflare Workers → `.claude/templates/paz/acb/cloudflare-worker.md`
- TypeScript → `.claude/templates/paz/acb/typescript.md`
- Jest → `.claude/templates/paz/acb/jest-testing.md`
- iOS → `.claude/templates/paz/acb/ios-swift.md`

### Step 4: Execute Comprehensive Analysis

Using the merged template structure, analyze the codebase following these sections:

1. **Project Overview** (from base template)
2. **Technology-Specific Analysis** (from detected templates)
3. **Directory Structure Analysis** (enhanced by tech templates)
4. **File-by-File Breakdown** (guided by tech-specific patterns)
5. **Architecture Deep Dive** (incorporating tech-specific patterns)
6. **Testing Analysis** (if testing framework detected)
7. **Deployment Analysis** (if deployment config detected)
8. **Technology Stack Breakdown** (comprehensive based on detections)
9. **Visual Architecture Diagram** (enhanced with tech-specific components)
10. **Key Insights & Recommendations** (tech-specific improvements)

### Step 5: Create Analysis Document

Create a comprehensive `codebase_analysis.md` that includes:
- Detected technologies and their specific analysis sections
- Integration between different technology stacks
- Technology-specific recommendations and best practices

## Report

```markdown
# [Project Name] Modular Codebase Analysis

> Modular Codebase Analysis - Last updated: [timestamp]
> Detected Technologies: [list of detected tech stack]

## Technology Detection Results
- **Project Type**: [Primary type based on detection]
- **Tech Stack**: [All detected technologies]
- **Templates Applied**: [List of templates that were merged]

## Quick Reference

### Primary Entry Points
[Technology-specific entry points based on detected stack]

### Key Integration Files
[Files specific to detected technologies]

### Common Patterns
[Patterns from merged templates]

## Testing Focus
[Testing analysis based on detected framework]

## Environment Setup
[Environment information based on detected deployment type]

## Debug Tips
[Debug information specific to detected technologies]

## Technology-Specific Insights
[Insights from each applied template]
```

---

## Example Usage

When you run this command on the compass project:

1. **Detection Phase**:
   - Finds `wrangler.jsonc` → Cloudflare Worker detected
   - Finds `@modelcontextprotocol/sdk` in package.json → MCP Server detected
   - Finds `jest.config.cjs` → Jest testing detected
   - Finds `tsconfig.json` → TypeScript detected

2. **Template Loading**:
   - Read `.claude/templates/paz/acb/base.md`
   - Read `.claude/templates/paz/acb/mcp-server.md`
   - Read `.claude/templates/paz/acb/cloudflare-worker.md`
   - Read `.claude/templates/paz/acb/typescript.md`
   - Read `.claude/templates/paz/acb/jest-testing.md`

3. **Merged Analysis**: Creates comprehensive analysis combining all templates

This approach ensures you get the right analysis depth for each project's specific technology stack.