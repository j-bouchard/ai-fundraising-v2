# Goose Recipe Reference

Complete reference for Goose recipe file structure, fields, and configurations.

## Recipe File Formats

- **YAML** (`.yaml`) - Recommended format
- **JSON** (`.json`) - Alternative format
- **Naming**: `recipe.yaml`, `recipe.json`, or `<recipe_name>.yaml`/`<recipe_name>.json`

## Format Types

### CLI Format
Recipe fields at root level. Used when creating recipes via CLI `/recipe` command or Recipe Generator.

### Desktop Format
Recipe fields nested inside `recipe` object with additional metadata. Used when creating from Goose Desktop.

## Complete Field Reference

### Required Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | String | Recipe format version (e.g., "1.0.0") |
| `title` | String | Short title describing the recipe |
| `description` | String | Detailed description of what the recipe does |

### Optional Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `instructions` | String | Template instructions that can include parameter substitutions |
| `prompt` | String | Template prompt (required in headless mode) |
| `parameters` | Array | List of parameter definitions |
| `extensions` | Array | List of extension configurations |
| `settings` | Object | Model provider and configuration |
| `sub_recipes` | Array | List of subrecipes |
| `response` | Object | Structured output validation |
| `retry` | Object | Automated retry logic configuration |

### Desktop Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Display name in Desktop Recipe Library |
| `isGlobal` | Boolean | Global vs project-local availability |
| `lastModified` | String | ISO timestamp of last modification |
| `isArchived` | Boolean | Archive status in Desktop interface |

## Parameter Structure

### Required Parameter Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | String | Unique identifier |
| `input_type` | String | "string" (default) or "file" |
| `requirement` | String | "required", "optional", or "user_prompt" |
| `description` | String | Human-readable description |

### Optional Parameter Fields

| Field | Type | Description |
|-------|------|-------------|
| `default` | String | Default value for optional parameters |

### Parameter Requirements

- **required**: Must be provided when using recipe
- **optional**: Can be omitted if default specified
- **user_prompt**: Interactively prompts user if not provided

### Input Types

- **string**: Uses value as-is in template substitution
- **file**: Reads file contents and substitutes actual content (not path)

## Extension Configuration

### Extension Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | String | Extension type (e.g., "stdio") |
| `name` | String | Unique extension name |
| `cmd` | String | Command to run extension |
| `args` | Array | Command arguments |
| `env_keys` | Array | (Optional) Required environment variables |
| `timeout` | Number | Timeout in seconds |
| `bundled` | Boolean | (Optional) Bundled with Goose |
| `description` | String | Extension description |
| `available_tools` | Array | (Optional) Specific tools to enable |

### Important: HTTP-Based MCP Servers with Authentication

**WARNING**: The `sse` and `streamable_http` extension types do NOT properly support custom authentication headers in Goose recipes. If you need to access an HTTP-based MCP server that requires authentication (Bearer tokens, API keys):

**DO NOT** use this pattern:
```yaml
extensions:
  - type: sse
    name: server
    uri: https://server.example.com/mcp
    headers:
      Authorization: "Bearer {{ API_KEY }}"  # This will NOT work
```

**INSTEAD**, use parameters and instructions:
```yaml
parameters:
  - key: API_KEY
    input_type: string
    requirement: optional
    description: "API key for authentication"
    default: "your-key"

instructions: |
  MCP server at: https://server.example.com/mcp
  Auth: Bearer {{ API_KEY }}
  Tools: tool1, tool2, tool3
  Access via HTTP with Authorization header.
```

## Settings Configuration

| Field | Type | Description |
|-------|------|-------------|
| `goose_provider` | String | AI provider (e.g., "anthropic", "openai") |
| `goose_model` | String | Specific model name |
| `temperature` | Number | Temperature setting (0.0-1.0) |

## Subrecipe Configuration

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Unique subrecipe identifier |
| `path` | String | Path to subrecipe file |
| `values` | Object | Pre-configured parameter values |
| `sequential_when_repeated` | Boolean | Force sequential execution |

## Retry Configuration

### Main Retry Fields

| Field | Type | Description |
|-------|------|-------------|
| `max_retries` | Number | Maximum retry attempts (required) |
| `timeout_seconds` | Number | Success check timeout (default: 300) |
| `on_failure_timeout_seconds` | Number | on_failure command timeout (default: 600) |
| `checks` | Array | Success check configurations (required) |
| `on_failure` | String | Shell command on failure |

### Success Check Structure

| Field | Type | Description |
|-------|------|-------------|
| `type` | String | Check type (currently only "shell") |
| `command` | String | Shell command (exit 0 for success) |

## Response Configuration

For structured JSON output:

```yaml
response:
  json_schema:
    type: object
    properties:
      field_name:
        type: string
        description: "Field description"
    required:
      - field_name
```

## Template Syntax

### Basic Substitution
```yaml
instructions: "Process {{ parameter_name }}"
prompt: "Task: {{ action }}"
```

### Advanced Features

- **Template inheritance**: `{% extends "parent.yaml" %}`
- **Blocks**: `{% block content %}...{% endblock %}`
- **indent() filter**: `{{ multi_line_param | indent(2) }}`

### Built-in Parameters

| Parameter | Description |
|-----------|-------------|
| `recipe_dir` | Directory containing the recipe file |

## Environment Variables

### Recipe Paths
- `GOOSE_RECIPE_PATH`: Additional directories to search for recipes

### GitHub Integration
- `GOOSE_RECIPE_GITHUB_REPO`: GitHub repository for recipes (requires `gh` CLI)

### Retry Timeouts
- `GOOSE_RECIPE_RETRY_TIMEOUT_SECONDS`: Global success check timeout
- `GOOSE_RECIPE_ON_FAILURE_TIMEOUT_SECONDS`: Global on_failure timeout

## Validation Rules

1. All template variables must have parameter definitions
2. Optional parameters must have default values
3. Parameter keys must be unique
4. Valid YAML/JSON syntax required
5. Required fields must be present
6. Extension configurations must be valid
7. Retry configurations must have required fields

## Common Errors

- Missing required parameters
- Optional parameters without defaults
- Template variables without definitions
- Invalid YAML/JSON syntax
- Shell commands with syntax errors
- Timeout exceeded errors
- Max retries exhausted
