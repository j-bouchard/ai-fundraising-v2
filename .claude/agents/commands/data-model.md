---
name: Data Model
allowed-tools: Bash, Read, Write
description: Generate a developer-focused data_model.md
---

# Analyze Codebase (Modular Templates)

Follow the `Workflow` for the `FOLDER_PATH` then `Report` the completed work.

## Variables

FOLDER_PATH: (to be provided by user)

## Workflow

If no `FOLDER_PATH` is provided, STOP immediately and ask the user to provide it.

### Step 1: Scan Folder

First, analyze the target directory to detect any code related to data models

### Step 2: Data Model Detection Logic

Detect models for these folders:

- **Swift Data Models**: `Models` 

### Step 3: Execute Comprehensive Analysis

I want to create entity relationship diagrams for the data models, service modules and UI data.

### Step 5: Create Analysis Document

Create a comprehensive `data_model.md` that includes:
- Detected models and their specific analysis sections
- Integration between models

## Report

```markdown
# [Project Name] Data Model Analysis

> Data Model Analysis - Last updated: [timestamp]

## Quick Reference

### Primary Data Models
[Technology-specific entry points based on detected models]

### Key Integration Files
[Files specific to detected technologies]

### Common Patterns
[Patterns from merged templates]

## Testing Focus
[Testing analysis based on detected models]

## Debug Tips
[Debug information specific to models]

## Technology-Specific Insights
[Insights from each applied template]
```