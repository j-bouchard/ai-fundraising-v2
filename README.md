# Resin Monorepo

A collection of AI-powered fundraising tools that integrate with Salesforce to help nonprofit professionals make data-driven decisions.

## Projects

### Resin (`mcp/resin/`)
A Model Context Protocol (MCP) server that provides AI assistants with tools to query donor data, analyze fundraising metrics, and perform audience segmentation directly from Salesforce.

**Key capabilities:**
- Natural language queries for donor data
- Pre-built fundraising analytics patterns
- SOQL query execution
- Salesforce record management
- Bearer token authentication for secure access

**Production:** https://resin.mpazbot.workers.dev

[View Resin Documentation →](CLAUDE.md#resin-project-overview)

### Mill (`mill/`)
A collection of fundraising workflow specifications and Goose recipes that orchestrate multi-step AI workflows for donor research, strategic planning, and follow-up communications.

**Key capabilities:**
- Donor research and enrichment workflows
- Data-driven strategic planning
- Follow-up email generation
- Fundraising analytics workflows

[View Mill Documentation →](mill/CLAUDE.md)

## Getting Started

Each project has its own setup and documentation. Navigate to the project directory and refer to its CLAUDE.md file for detailed instructions.

## Loading MCP Servers

```bash
claude --mcp-config .mcp.json.context7
```