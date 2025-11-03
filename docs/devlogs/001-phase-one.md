# **Goose Recipe Pipeline Project Specification**  
  
## **Overview**  
  
This project establishes an automated pipeline for creating high-quality Goose recipes that enable AI-powered fundraising analytics through Salesforce MCP integration. The solution leverages Claude Code's custom commands and specialized agents to transform simple specifications into production-ready Goose recipes.  
  
## **Background**  
  
### **Claude Code**  
  
Claude Code is Anthropic's official CLI tool that provides an interactive development environment powered by Claude AI. It extends beyond simple code generation by offering:  
  
- **Custom Commands**: User-defined operations (stored as ==.md== files in ==.claude/commands/==) that can be invoked with slash commands (e.g., ==/analyze-data==)  
- **Specialized Agents**: Purpose-built AI agents that can be spawned to handle specific tasks autonomously (e.g., research, quality control, code review)  
- **Tool Integration**: Direct access to file operations, bash commands, web search, and custom tooling  
  
### **Claude Commands**  
  
Commands in Claude Code are markdown files that define reusable workflows:  
  
```
---
title: command-name
description: What this command does
---

## Workflow
Step-by-step instructions for Claude to follow...

## Settings
Configuration parameters...

```
  
  
These commands act as templates that guide Claude through complex, multi-step processes with consistent quality.  
  
### **Claude Agents**  
  
Agents are autonomous workers that Claude Code can spawn to handle specialized tasks:  
  
- **Research Agents**: Gather documentation and technical specifications  
- **Quality Control Agents**: Validate outputs against standards  
- **General Purpose Agents**: Handle complex multi-step tasks  
- **Work Summary Agents**: Provide concise summaries and next steps  
  
Agents can run in parallel and work independently, then report results back to the main session.  
  
## **The Solution: Recipe Pipeline**  
  
### **Problem Statement**  
  
Creating effective Goose recipes for fundraising analytics requires:  
1. Understanding Salesforce MCP server capabilities  
2. Translating business requirements into structured YAML  
3. Optimizing prompts for agent behavior  
4. Ensuring consistent formatting and quality  
5. Testing and validation  
  
Doing this manually is time-consuming and error-prone.  
  
### **Why Agentic Workflows Matter**  
  
The key insight is that **humans should think in fundraising domain language, not recipe syntax**. When you want to analyze donor retention, you should describe it as a fundraising analyst would—not as a YAML engineer.  
  
This is where Claude Code's agentic approach excels:  
  
**Human Expertise**: You focus on what you know best—fundraising analytics, donor behavior, campaign metrics. You describe tasks in natural language using domain concepts like "recurring donors," "lapsed contributions," or "campaign ROI."  
  
**Claude's Translation**: The agent handles the technical translation—converting your fundraising requirements into properly structured Goose recipes with correct YAML syntax, optimal model settings, and appropriate MCP server integration patterns.  
  
**Why Claude Does This Better**:  
- **Context Switching**: Humans struggle switching between fundraising thinking and technical YAML syntax. Claude maintains both contexts simultaneously.  
- **Pattern Recognition**: Claude has seen thousands of recipe patterns and can instantly apply best practices that would take humans hours to research.  
- **Consistency**: Claude never forgets a closing bracket, misindents YAML, or uses deprecated syntax—common human errors that break recipes.  
- **Optimization**: Claude knows which model works best for which task, optimal temperature settings, and how to structure prompts for agent behavior—knowledge that requires deep technical expertise.  
  
The result: You spend your time on strategy and analysis (your expertise), while Claude handles the technical implementation (its expertise). This isn't just faster—it's fundamentally better because each party works in their domain of strength.  
  
### **Proposed Pipeline**  
  
A document conversion pipeline powered by Claude Code custom commands and agents:  
  
```
Spec Document → Command Agent → Recipe YAML → Quality Agent → Validated Recipe

```
  
  
**Phase 1: Specification Input**  
- Simple markdown document describing the fundraising analytics task  
- Natural language description of desired outputs  
- Reference to fundraisingaimcp MCP server capabilities  
  
**Phase 2: Conversion Agent**  
- Custom Claude command (==/spec-to-recipe==) processes the specification  
- Extracts workflow steps, settings, and configuration  
- Generates properly structured Goose recipe YAML  
  
**Phase 3: Quality Validation**  
- Quality control agent reviews generated recipe  
- Validates YAML syntax and Goose compatibility  
- Checks for best practices (model selection, prompt optimization)  
- Ensures MCP server integration patterns are correct  
  
**Phase 4: Output**  
- Production-ready Goose recipe file  
- Documentation on usage and configuration  
- Integration instructions for fundraising platform  
  
### **Example Flow**  
  
```
# User creates simple spec
$ cat fundraising-spec.md
---
title: donor-retention-analysis
description: Analyze donor retention patterns
---
Analyze our donor database to identify retention trends...

# Run conversion pipeline
$ claude
> /spec-to-recipe fundraising-spec.md

# Claude spawns agents:
# - Conversion agent transforms spec → YAML
# - Quality agent validates output
# - Research agent checks MCP compatibility

# Output: recipes/donor-retention-analysis.yaml (ready to use)

```
  
  
## **Deliverables**  
  
1. **Custom Claude Commands** (==.claude/commands/==)  
    - ==/spec-to-recipe==: Converts spec documents to Goose recipes  
    - ==/validate-recipe==: Quality checks for recipe files  
    - ==/optimize-recipe==: Enhances prompts and settings  
  
2. **Agent Configurations**  
    - Recipe conversion agent  
    - Quality control agent specialized for Goose recipes  
    - Salesforce MCP integration agent  
  
3. **Template Library**  
    - Fundraising analytics spec templates  
    - Recipe YAML templates optimized for MCP  
  
4. **Documentation**  
    - Pipeline usage guide  
    - One-on-one training  
    - Best practices for spec writing  
  
## **Technical Requirements**  
  
- **Required**: Claude Code CLI installed and configured  
- **Required**: Access to Claude API (Anthropic account)  
- **Recommended**: Familiarity with YAML and markdown  
- **Target Platform**: Goose Desktop + fundraisingaimcp MCP server  
  
## **Project Scope**  
  
### **Phase 1: Foundation**  
  
This is intentionally scoped as a **foundational phase** focused on establishing the core workflow rather than attempting to solve all edge cases upfront. The deliverables create a working pipeline that can be extended based on real-world usage patterns.  
  
**Breakdown:**  
- Setup and configuration  
- Command and agent development  
- Testing and refinement  
- One-on-one training session  
  
**Why This Scope:**  
- Proves the concept with a working pipeline  
- Establishes patterns for future expansion  
- Includes knowledge transfer for self-sufficiency  
- Keeps initial investment low while delivering immediate value  
  
**Future Phases** (optional, based on need):  
- Advanced validation and error handling  
- Additional recipe templates for complex analytics  
- Integration with CI/CD workflows  
- Extended training and support  
  
## **Benefits**  
  
1. **Speed**: Transform specs into recipes in minutes vs hours  
2. **Consistency**: Standardized recipe structure and quality  
3. **Scalability**: Easy to create multiple recipes for different analytics tasks  
4. **Quality**: Automated validation catches errors early  
5. **Knowledge Transfer**: Training ensures self-sufficiency  
  
## **Proof of Concept**  
  
A simple proof of concept has been developed and tested successfully, demonstrating the core pipeline functionality. The example shows the conversion of a specification document into a working Goose recipe for donation analytics.  
  
### **Example Specification**  
  
```
---
title: donation-analytics
description: Proof of concept
allowed-tools: fundraisingaimcp MCP server
---

# Donation Analytics

## Workflow

Using the fundraisingaimcp MCP server, please analyze our fundraising data, save the output to a markdown file.

- First, get an overview of total donations by running a SOQL query to count all opportunities with Amount > 0
- Then analyze donation patterns by stage (Closed Won vs Closed Lost)
- Identify our top 10 largest donations
- Create a detailed report that includes the list of total donations

## Settings

- goose_provider: "anthropic"
- goose_model: "claude-sonnet-4-20250514"
- temperature: 0.8

```
  
  
### **Generated Goose Recipe**  
  
```
title: donation-analytics
description: Proof of concept

prompt: |
  Using the fundraisingaimcp MCP server, please analyze our fundraising data, save the output to a markdown file.

  - First, get an overview of total donations by running a SOQL query to count all opportunities with Amount > 0
  - Then analyze donation patterns by stage (Closed Won vs Closed Lost)
  - Identify our top 10 largest donations
  - Create a detailed report that includes the list of total donations

settings:
  goose_provider: "anthropic"
  goose_model: "claude-sonnet-4-20250514"
  temperature: 0.8

```
  
  
**Status**: This recipe has been tested and is working as expected. It successfully connects to the fundraisingaimcp MCP server, executes SOQL queries, and generates analytical reports on donation data.  
  
## **Next Steps**  
  
1. Confirm Claude Code installation  
2. Review example spec and generated recipe  
3. Schedule training session  
4. Identify first 2-3 fundraising analytics use cases to build  
