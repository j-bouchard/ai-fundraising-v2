---
name: Convert Specs to Recipes
allowed-tools: Read, Write, Bash, Glob
description: Convert all spec files to Goose recipes (global regeneration)
---

# Convert Specs to Recipes

Converts all spec markdown files in the `spec/` directory to Goose YAML recipes in the `recipes/` directory. This is a global regeneration command suitable for early development.

## Variables

None required - automatically discovers all spec files.

## Workflow

### Step 1: Discover Spec Files

1. Find all markdown files in `spec/*/` subdirectories
2. Exclude `spec.md` and `orchestrator.md` files
3. Pattern: `spec/*/*.md` (files like `spec/donor-research-and-enrichment/01-retrieve-salesforce-foundation.md`)

### Step 2: Convert Each Spec File

**IMPORTANT: Process files one at a time to minimize context usage.**

Read the instructions template ONCE before the loop:
- Read `.claude/templates/instructions.md`
- This template provides standard instructions for all Goose recipes

Then, for each discovered spec file, process sequentially:

1. **Read and parse the current spec file:**
   - Extract YAML frontmatter (`title`, `description`, `allowed-tools`)
   - Extract the H3 section content (exclude the H3 header line itself)
   - Stop at next H2 section (e.g., `## Settings`)

2. **Determine settings for this file:**
   - Default settings:
     - `goose_provider: "anthropic"`
     - `goose_model: "claude-sonnet-4-20250514"`
     - `temperature: 0.5`
   - For data analysis workflows: `temperature: 0.4`
   - For strategic planning workflows: `temperature: 0.6`

3. **Create recipe YAML:**
   ```yaml
   version: "1.0.0"
   title: {from frontmatter}
   description: {from frontmatter}

   prompt: |
     {Content from H3 section - exclude H3 header, include bullet points and text}

   settings:
     goose_provider: "anthropic"
     goose_model: "claude-sonnet-4-20250514"
     temperature: {0.4-0.6 depending on workflow}

   instructions: |
     {Base template content from .claude/templates/instructions.md}

   extensions:
     - type: stdio
       name: fundraisingaimcp
       cmd: /Users/mpaz/workspace/ai-fundraising/.venv/bin/python
       args:
         - /Users/mpaz/workspace/ai-fundraising/fundraising_mcp_server.py
       timeout: 300
       description: "Fundraising AI MCP server for Salesforce integration"
   ```

4. **Write recipe file:**
   - Mirror the spec directory structure in recipes/
   - Input: `spec/workflow-name/01-task.md`
   - Output: `recipes/workflow-name/01-task.yaml`
   - Create directories as needed

5. **Move to next file** (do not read all files at once)

### Step 3: Summary

Provide a summary showing:
- Total number of spec files found
- Total number of recipes created
- List of all created recipes grouped by workflow
- Any errors or skipped files

## Temperature Guidelines

- **Fundraising Data Analysis**: 0.4 (analytical)
- **Donor Research and Enrichment**: 0.5 (balanced)
- **Donor Sourcing and Prioritization**: 0.5 (balanced)
- **Follow-up and Logging**: 0.5 (balanced)
- **Fundraising Strategic Planning**: 0.6 (creative)

## Example Output

```bash
# Discovers files:
spec/donor-research-and-enrichment/01-retrieve-salesforce-foundation.md
spec/donor-research-and-enrichment/02-conduct-external-research.md
spec/donor-sourcing-and-prioritization/01-source-donor-pool.md
...

# Creates recipes:
recipes/donor-research-and-enrichment/01-retrieve-salesforce-foundation.yaml
recipes/donor-research-and-enrichment/02-conduct-external-research.yaml
recipes/donor-sourcing-and-prioritization/01-source-donor-pool.yaml
...

Summary: 15 spec files converted to 15 recipes
```
