# Fundraising AI Workflow Specifications

Modular AI workflow specifications and Goose recipes for fundraising operations, integrated with Salesforce and external research tools.

## Overview

This repository contains structured workflow specifications for AI-powered fundraising tasks. Each workflow is broken down into modular sub-tasks that can be executed independently or orchestrated together.

## Usage

### Split Spec

Use the `/spec-split` slash command in Claude Code to automatically:
1. Split spec markdown files by H3 sections
2. Generate sub-specs

### Convert to Recipes

Use the `/spec-recipe` slash command in Claude Code to automatically:
1. Generate Goose YAML recipes for each sub-spec

### Running Recipes

```bash
# from the repo root
goose run --recipe recipes/fundraising-data-analysis/01-revenue-analysis.yaml
```

