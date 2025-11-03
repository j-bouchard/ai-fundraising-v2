# Mill Script Organization and Analysis Recipe Skill

**Date:** 2025-10-31
**Location:** `scripts/mill/`, `.claude/skills/goose-recipe-analysis/`

## Overview

Reorganized Mill recipe runner scripts into a dedicated `scripts/mill/` directory and created a new `goose-recipe-analysis` skill for document analysis recipes. This establishes clear separation between configuration (mill/), documentation (specs), and execution (scripts/), while supporting two distinct recipe workflows: data extraction and data analysis.

## Problem Statement

The original Mill structure mixed configuration and execution in the same directory:

```
mill/
├── spec/                           # Specifications
├── recipes/                        # Recipe YAML files
└── run-fundraising-analysis.sh     # Executable scripts (mixed!)
```

Additionally, the existing `goose-recipes` skill was designed for MCP-powered data extraction recipes that query live Salesforce data. We needed a second type of recipe for analyzing saved reports without MCP server access, but had no clear pattern for creating these analysis recipes.

## Solution

### 1. Script Reorganization

Created a new directory structure that separates concerns:

```
mill/
├── spec/          # Workflow specifications (documentation)
└── recipes/       # Goose recipe YAML files (configuration)

scripts/mill/      # Executable runner scripts (execution)
└── run-*.sh
```

**Benefits:**
- ✅ Clear separation: mill/ is purely config/docs
- ✅ Consistency: Follows existing `scripts/devops/` pattern
- ✅ Scalability: Won't clutter mill/ as recipes grow
- ✅ Standard convention: Common project pattern

### 2. New goose-recipe-analysis Skill

Created a specialized skill for document analysis recipes with simplified templates that don't require MCP authentication or JSON schema validation.

## Implementation

### Scripts Migration

Moved existing scripts to new location:

```bash
# Created new directory
mkdir -p scripts/mill

# Moved scripts
mv mill/run-fundraising-analysis.sh scripts/mill/
mv mill/run-fundraising-followup.sh scripts/mill/

# Made executable
chmod +x scripts/mill/*.sh
```

### Documentation Updates

Updated all references across the codebase:

**Files modified:**
- `CLAUDE.md` - Updated script paths in examples
- `mill/CLAUDE.md` - Updated directory structure and usage examples
- `.claude/skills/goose-recipe-analysis/SKILL.md` - File organization docs
- `.claude/skills/goose-recipe-analysis/assets/runner-script-template.sh` - Added location comments

### New Skill Structure

Created complete skill implementation:

```
.claude/skills/goose-recipe-analysis/
├── SKILL.md                                    # Complete skill documentation
├── assets/
│   ├── analysis-recipe-template.yaml          # Recipe template (no MCP)
│   └── runner-script-template.sh              # Script template
└── references/
    └── (inherits from goose-recipes skill)
```

## Recipe Type Comparison

The project now supports two distinct recipe types:

| Feature | goose-recipes | goose-recipe-analysis |
|---------|---------------|----------------------|
| **Purpose** | Extract live data | Analyze saved documents |
| **MCP Server** | ✅ Required (Resin) | ❌ Not needed |
| **Authentication** | ✅ Bearer token | ❌ None |
| **Input** | Parameters | File content (`input_type: file`) |
| **Output** | Structured JSON | Markdown analysis |
| **Validation** | JSON schema + retry | Completion check |
| **Use Case** | Query Salesforce | Generate insights |

**Example workflow:**

```
Step 1: Data Extraction (goose-recipes)
  ↓
  ./scripts/mill/run-fundraising-analysis.sh
  ↓
  Queries Salesforce → Generates report.md

Step 2: Analysis (goose-recipe-analysis)
  ↓
  ./scripts/mill/run-fundraising-followup.sh --input report.md
  ↓
  Reads report.md → Generates analysis with recommendations
```

## Usage

### Running Scripts from Repo Root

All scripts are now executed from the repository root:

```bash
# Data extraction recipe
./scripts/mill/run-fundraising-analysis.sh

# Analysis recipe
./scripts/mill/run-fundraising-followup.sh \
  --input reports/fundraising-data-analysis/2024-10-31-1400/report.md
```

### Creating Analysis Recipes

Use the new skill in Claude Code:

```
Use the goose-recipe-analysis skill to create a recipe for mill/spec/your-analysis-spec.md
```

This generates:
- `mill/recipes/your-analysis-recipe.yaml` - Recipe configuration
- `scripts/mill/run-your-analysis.sh` - Runner script

## Key Design Patterns

### 1. File-Based Input for Analysis

Analysis recipes use `input_type: file` to read document content:

```yaml
parameters:
  - key: input_file
    input_type: file
    requirement: required
    description: "Path to the report file to analyze"
```

This passes the entire file content as a template variable: `{{ input_file }}`

### 2. Simplified Template (No MCP Complexity)

Analysis recipes don't need MCP authentication patterns:

```yaml
# No extensions needed
# No JSON schema validation
# Just instructions and prompt

instructions: |
  Analyze this report:
  {{ input_file }}

  Follow the analysis framework...
```

### 3. Auto-Generated Output Paths

Runner scripts intelligently default output paths:

```bash
# If no output specified, save alongside input
if [ -z "$OUTPUT_FILE" ]; then
  INPUT_DIR=$(dirname "$INPUT_FILE")
  INPUT_BASENAME=$(basename "$INPUT_FILE" .md)
  OUTPUT_FILE="${INPUT_DIR}/${INPUT_BASENAME}-analysis.md"
fi
```

This creates organized output:
```
reports/fundraising-data-analysis/2024-10-31-1400/
├── report.md                    # Original data extract
└── report-analysis.md           # Generated analysis
```

### 4. Template Variable Substitution

Runner script template uses placeholders for easy generation:

```bash
RECIPE_NAME="RECIPE_NAME"          # ← Replaced by skill
RECIPE_PATH="mill/recipes/${RECIPE_NAME}.yaml"
OUTPUT_FILE="RECIPE_NAME-output.md"
```

The skill performs simple string replacements:
- `RECIPE_NAME` → actual recipe name
- `RECIPE_TITLE` → human-readable title
- `DESCRIPTION` → recipe description

## Recipe Template Structure

### Analysis Recipe Template

```yaml
version: "1.0.0"
title: "Document Analysis Recipe Title"
description: "What this recipe accomplishes"

parameters:
  - key: input_file
    input_type: file              # ← Reads file content
    requirement: required

  - key: output_file
    input_type: string
    requirement: optional
    default: "analysis-output.md"

instructions: |
  # Analysis Framework
  {{ input_file }}                # ← File content inserted here

  ## Your Analysis Sections
  [Framework from spec...]

prompt: "Analyze the document following the framework above."

settings:
  goose_provider: "anthropic"
  goose_model: "claude-sonnet-4-20250514"
  temperature: 0.5                # ← Lower for consistent analysis
```

**Key differences from extraction recipes:**
- ✅ File input instead of parameters
- ✅ No MCP server configuration
- ✅ No JSON schema
- ✅ No retry/validation logic
- ✅ Lower temperature for consistency

## First Analysis Recipe: fundraising-data-analysis-followup

Created the first analysis recipe to demonstrate the pattern:

**Spec:** `mill/spec/fundraising-data-analysis-followup.md`
**Recipe:** `mill/recipes/fundraising-data-analysis-followup.yaml`
**Runner:** `scripts/mill/run-fundraising-followup.sh`

**What it does:**
- Reads a saved fundraising report
- Validates data quality and completeness
- Extracts key metrics and trends
- Generates time-aware, prioritized action items
- Outputs comprehensive analysis with executive summary

**Analysis framework includes:**
1. Context Validation (report date, fiscal position)
2. Financial Performance Analysis (core + derived metrics)
3. Pipeline Health Assessment (distribution + risks)
4. Donor Segmentation Analysis (segments + retention)
5. Seasonal & Trend Analysis (timing + YoY)
6. Action Item Generation (prioritized by urgency)
7. Data Quality Assessment (gaps + consistency)

**Time-aware recommendations:**
The recipe includes current date context and generates quarter-specific advice:
- Q1: Sustaining momentum, planning Q2
- Q2: Mid-year strategy, summer campaigns
- Q3: Summer initiatives, year-end prep
- Q4: Year-end giving, next year planning

## Best Practices

### ✅ Do

- Use `goose-recipe-analysis` skill for all analysis recipes
- Save analysis output alongside original reports
- Include current date/quarter context in instructions
- Structure analysis frameworks with numbered sections
- Provide specific action item templates in instructions
- Run scripts from repository root

### ❌ Don't

- Don't manually create analysis recipes
- Don't use MCP patterns in analysis recipes
- Don't put runner scripts in mill/ directory
- Don't forget to make scripts executable (`chmod +x`)
- Don't hardcode output paths (let scripts auto-generate)

## Migration Notes

### Existing Scripts

The following scripts were moved:

| Old Path | New Path |
|----------|----------|
| `mill/run-fundraising-analysis.sh` | `scripts/mill/run-fundraising-analysis.sh` |
| `mill/run-fundraising-followup.sh` | `scripts/mill/run-fundraising-followup.sh` |

### Breaking Changes

⚠️ **Script paths changed** - Update any automation:

```bash
# Old (no longer works)
./mill/run-fundraising-analysis.sh

# New (correct path)
./scripts/mill/run-fundraising-analysis.sh
```

### Documentation Updates

All documentation now references the new paths:
- Root `CLAUDE.md` - Examples use `./scripts/mill/`
- `mill/CLAUDE.md` - Directory structure updated
- Skill documentation - Templates reference new location

## Future Enhancements

### Potential Improvements

1. **Skill auto-discovery** - Currently need to use skill pattern manually, could auto-detect from file structure
2. **Recipe validation** - Could add linting for analysis recipes
3. **Template variations** - Different templates for different analysis types
4. **Report chaining** - Automatically run analysis after extraction completes
5. **Scheduled execution** - cron/CI integration for regular reports

### Additional Analysis Recipes

Using this pattern, we can create more analysis recipes:

- **Campaign analysis** - Analyze campaign performance reports
- **Donor journey** - Analyze donor engagement patterns
- **Comparative analysis** - Compare multiple period reports
- **Trend projection** - Forecast based on historical data
- **Risk assessment** - Identify fundraising risks

## Related Documentation

- **Skills:** `.claude/skills/goose-recipe-analysis/SKILL.md`
- **Original skill:** `.claude/skills/goose-recipes/SKILL.md`
- **Mill documentation:** `mill/CLAUDE.md`
- **Root documentation:** `CLAUDE.md`
- **Report organization:** `docs/DEVLOG-2025-10-31-reports-organization.md`

## Inspiration

This organization pattern follows standard project conventions:
- **Scripts directory** - Common in open source projects (npm, python, etc.)
- **Separation of concerns** - Config vs. execution vs. documentation
- **Skill specialization** - Similar to task-specific CLI tools

## Technical Details

### Script Template Features

The runner script template includes:

```bash
# Color output for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Smart output path defaults
if [ -z "$OUTPUT_FILE" ]; then
  INPUT_DIR=$(dirname "$INPUT_FILE")
  INPUT_BASENAME=$(basename "$INPUT_FILE" .md)
  OUTPUT_FILE="${INPUT_DIR}/${INPUT_BASENAME}-analysis.md"
fi

# Automatic directory creation
OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir -p "$OUTPUT_DIR"
fi

# Exit status checking
if [ -f "$OUTPUT_FILE" ]; then
  echo -e "${GREEN}✓ Analysis complete!${NC}"
else
  echo -e "${RED}✗ Analysis failed${NC}"
  exit 1
fi
```

### Skill Implementation Notes

The skill follows this workflow:

1. **Read spec file** - Parse frontmatter and content
2. **Extract sections** - Identify framework, output requirements
3. **Generate recipe** - Create YAML with file input parameters
4. **Generate script** - Create bash runner with smart defaults
5. **Save files** - Recipe to `mill/recipes/`, script to `scripts/mill/`

The skill can be invoked with:

```
Use the goose-recipe-analysis skill to create a recipe for mill/spec/[filename].md
```

## Success Metrics

This reorganization achieves:

- ✅ **Clear structure** - Config, docs, and execution separated
- ✅ **Standard convention** - Follows common project patterns
- ✅ **Scalability** - Room to grow without clutter
- ✅ **Discoverability** - Scripts in predictable location
- ✅ **Consistency** - Matches existing `scripts/devops/` pattern
- ✅ **Two recipe types** - Extraction and analysis workflows
- ✅ **Complete tooling** - Skill generates everything needed

## Next Steps

1. ✅ Script reorganization complete
2. ✅ New skill created and documented
3. ✅ First analysis recipe generated
4. 🔄 Test recipes in production workflows
5. 📋 Create additional analysis recipes as needed
6. 📋 Consider CI/CD integration for scheduled runs
