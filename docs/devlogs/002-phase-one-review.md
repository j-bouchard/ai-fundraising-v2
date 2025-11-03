# Phase One Review: Goose Recipe Pipeline

## Executive Summary

Phase One successfully delivered a complete document generation pipeline for creating Goose recipes from natural language specifications. The implementation established a three-tier architecture that automates the conversion of fundraising workflow specifications into production-ready Goose recipes with Salesforce MCP integration.

**Current State**: 5 core fundraising workflows, 24 automated sub-recipes, and 2 custom Claude Code commands.

## What Was Built

### Three-Tier Architecture

The pipeline implements a hierarchical document generation system:

**1. Source Files** (`source/` directory)
- **Purpose**: Single source of truth for all workflow specifications
- **Format**: Human-authored markdown files with frontmatter
- **Editing**: Hand-edited only - all other files are generated
- **Count**: 5 core workflow specifications

**2. Spec Files** (`spec/` directory)
- **Purpose**: Structured specifications split by task (H3 sections)
- **Format**: Individual markdown files per sub-task
- **Generation**: Automatically created via `/split-spec` command
- **Structure**: `spec/{workflow-name}/` directories containing:
  - `spec.md` - Copy of original source file
  - `01-task-name.md`, `02-task-name.md`, etc. - Individual sub-tasks

**3. Recipe Files** (`recipes/` directory)
- **Purpose**: Executable Goose recipes in YAML format
- **Format**: Goose-compatible YAML with settings, extensions, and prompts
- **Generation**: Automatically created via `/convert-specs` command
- **Structure**: Mirrors `spec/` structure with `.yaml` files

### Custom Claude Code Commands

**`/split-spec`** - Specification Decomposition
- Discovers all markdown files in `source/` directory
- Splits each file by H3 sections into individual task files
- Creates numbered files (01-task.md, 02-task.md, etc.)
- Preserves frontmatter and maintains document structure

**`/convert-specs`** - Recipe Generation
- Discovers all split spec files in `spec/*/` directories
- Converts each spec file to Goose YAML recipe format
- Applies workflow-specific settings:
  - Data Analysis: temperature 0.4 (analytical)
  - Strategic Planning: temperature 0.6 (creative)
  - Other workflows: temperature 0.5 (balanced)
- Injects standardized instructions from template
- Configures fundraisingaimcp MCP server integration

### Templates System

**Instructions Template** (`.claude/templates/instructions.md`)
- Standardized task execution patterns
- Scratchpad.txt tracking for work items
- Output directory conventions (./data-dump)

## Usage

### Split Spec

Use the `/split-spec` slash command in Claude Code to automatically:
1. Split spec markdown files by H3 sections
2. Generate sub-specs

### Convert to Recipes

Use the `/convert-specs` slash command in Claude Code to automatically:
1. Generate Goose YAML recipes for each sub-spec

### Running Recipes

```bash
# Run individual recipe
goose run --recipe recipes/fundraising-data-analysis/01-revenue-analysis.yaml
```

### Loading MCP Servers

```bash
claude --mcp-config .mcp.json.context7
```

## Technical Implementation

### Recipe Structure

Every generated recipe follows this format:

```yaml
version: "1.0.0"
title: Task Name
description: Task description from frontmatter

prompt: |
  {Content from H3 section - task-specific instructions}

settings:
  goose_provider: "anthropic"
  goose_model: "claude-sonnet-4-20250514"
  temperature: 0.4-0.6  # Workflow-specific

instructions: |
  {Standardized instructions from template}

extensions:
  - type: stdio
    name: fundraisingaimcp
    cmd: /Users/mpaz/workspace/ai-fundraising/.venv/bin/python
    args:
      - /Users/mpaz/workspace/ai-fundraising/fundraising_mcp_server.py
    timeout: 300
    description: "Fundraising AI MCP server for Salesforce integration"
```

### Directory Structure

```
spec_docs/
├── source/                          # SOURCE OF TRUTH (hand-edited)
│   ├── donor-research-and-enrichment.md
│   ├── donor-sourcing-and-prioritization.md
│   ├── followup-and-logging.md
│   ├── fundraising-data-analysis.md
│   └── fundraising-strategic-planning.md
├── spec/                            # GENERATED (do not edit)
│   ├── donor-research-and-enrichment/
│   │   ├── spec.md
│   │   ├── 01-retrieve-salesforce-foundation.md
│   │   ├── 02-conduct-external-research.md
│   │   └── ...
│   └── ...
├── recipes/                         # GENERATED (do not edit)
│   ├── donor-research-and-enrichment/
│   │   ├── 01-retrieve-salesforce-foundation.yaml
│   │   ├── 02-conduct-external-research.yaml
│   │   └── ...
│   └── ...
└── .claude/
    ├── commands/
    │   ├── spec-split.md           # /split-spec command
    │   └── spec-recipe.md          # /convert-specs command
    └── templates/
        └── instructions.md          # Standardized recipe instructions
```

## Proof of Concept Results

### Tested and Working
- All 24 sub-recipes successfully generate valid Goose YAML
- MCP server integration functional (fundraisingaimcp)
- SOQL queries execute correctly against Salesforce
- Output files successfully created in data-dump directories

### Example Execution
**Recipe**: `recipes/fundraising-data-analysis/01-revenue-analysis.yaml`

**Results**:
- $30.6M total revenue analyzed across 12,207 opportunities
- Foundation grants identified as 45% of revenue ($91K average)
- Peak performance year 2022 ($5.38M) identified
- Strategic recommendations generated automatically
- Markdown reports created with tables and visualizations

## Benefits Achieved

1. **Speed**: Specification to working recipe in seconds (vs. hours of manual YAML writing)
2. **Consistency**: All 24 recipes follow identical structure and quality standards
3. **Scalability**: Adding new workflows requires only source markdown editing
4. **Maintainability**: Single source of truth enables global updates via regeneration
5. **Modularity**: Sub-recipes can be executed independently for specific tasks

## Current Limitations

1. **Manual Quality Review**: No automated validation agents (deferred to future phase)
2. **Hard-coded Paths**: MCP server path is absolute, not parameterized
3. **Output Directory**: Uses relative paths which can cause confusion about file locations
4. **Error Handling**: Recipes don't validate successful file creation (retry logic available but not implemented)

## Output Organization

### Current Behavior

When recipes are executed via `goose run --recipe recipes/fundraising-data-analysis/01-revenue-analysis.yaml`, all output files are written to a flat `./data-dump` directory structure. This means:

- Multiple recipe runs write to the same directory
- No automatic organization by workflow, date, or execution context
- Files from different analyses can intermingle
- Manual cleanup or organization is required between runs

## Conclusion

Phase One successfully delivered a production-ready document generation pipeline that transforms natural language fundraising specifications into executable Goose recipes. The three-tier architecture provides clear separation of concerns, enables version control, and supports rapid iteration.

**Key Achievement**: Reduced recipe creation time from hours to seconds while maintaining high quality and consistency across 24 automated workflows.

**Status**: Ready for production use with five complete fundraising workflow families. Orchestration capabilities tested and ready for Phase Two implementation.
