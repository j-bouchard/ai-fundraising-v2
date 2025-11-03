---
name: Split Spec by H3
allowed-tools: Read, Write, Bash
description: Split all markdown spec files in a folder by H3 sections
---

# Split Spec by H3

Splits all markdown spec files in a folder into individual files by H3 sections.

## Variables

SOURCE_FOLDER: (optional - path to folder containing markdown files to split, defaults to source/)

## Workflow

### Step 0: Discover Source Files

1. If `SOURCE_FOLDER` is not provided, use `source/`
2. Find all markdown files (*.md) in `SOURCE_FOLDER`
3. Process each file found

### Step 1: Read Source File

For each markdown file discovered:

1. Read the markdown file
2. Get the base filename (without extension)

### Step 2: Parse H3 Sections

1. Parse the content to identify all H3 sections (`### `)
2. Extract the YAML frontmatter (if present)
3. Extract content before first H3 (typically H1 and H2 headers)

### Step 3: Create Output Structure

For each source file:

1. Determine output folder: `spec/{base-filename}/`
2. Create the output folder if it doesn't exist
3. Copy original file to `{OUTPUT_FOLDER}/spec.md`

### Step 4: Split into Individual Files

For each H3 section:

1. Generate filename: zero-padded number + slugified H3 text (e.g., `01-source-donor-pool.md`)
2. Build file content:
   ```markdown
   ---
   {YAML frontmatter from original file}
   ---

   {H1 and H2 headers from before first H3}

   ### {H3 Title}
   {H3 section content until next H3 or H2}
   ```
3. Write to `{OUTPUT_FOLDER}/{number}-{slug}.md`

### Step 5: Create Orchestrator

Create `{OUTPUT_FOLDER}/orchestrator.md` that lists all sub-recipes in order:

```markdown
---
title: {Base Filename} Orchestrator
description: Coordinates {workflow} sub-recipes in sequence
---

# {Base Filename} Orchestrator

Execute these recipes in order:

1. {number}-{slug}
2. {number}-{slug}
...

Generate a final summary report after all recipes complete.
```

### Step 6: Summary

Provide a summary showing:
- Total number of source files processed
- For each source file:
  - Number of H3 sections found and split
  - Output directory: `spec/{base-filename}/`
  - List of created files

## Example

```bash
# Input
SOURCE_FOLDER: source/ (default)

# Discovers and processes:
source/donor-sourcing-and-prioritization.md
source/donor-research-and-enrichment.md
source/followup-and-logging.md
...

# Creates:
spec/donor-sourcing-and-prioritization/
  ├── spec.md
  ├── 01-source-donor-pool.md
  ├── 02-prioritize-donors.md
  ├── 03-note-enrichment-opportunities.md
  └── orchestrator.md

spec/donor-research-and-enrichment/
  ├── spec.md
  ├── 01-retrieve-salesforce-foundation.md
  ├── 02-conduct-external-research.md
  └── orchestrator.md
...
```

## Architecture

This command is part of a document generation pipeline:
1. **source/**: Hand-edited source specs (SOURCE OF TRUTH)
2. **spec/**: Generated split specs (DO NOT EDIT BY HAND)
3. **recipes/**: Generated Goose recipes (DO NOT EDIT BY HAND)
