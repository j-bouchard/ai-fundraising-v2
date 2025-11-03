# MCP Server Analysis Template - Implementation Focused

## MCP-Specific Project Overview & Quick Start

**Protocol Version**: [Check @modelcontextprotocol/sdk version in package.json]
**Server Framework**: [Detect ModelFetch, direct SDK, or custom implementation]
**Development Command**: [Extract from package.json scripts - typically mcp-server or dev]

### MCP Development Setup
```bash
# MCP Server Development Commands
[MCP development server command]
[Client connection testing command]
[Protocol testing command]
```

## MCP Server Implementation Analysis

### Server Entry Point - [filename]
- **Purpose**: MCP server initialization and configuration
- **Key Implementation Details**:
  - **Tool Registration**: [Number] tools registered with [schema validation method]
  - **Resource Registration**: [Number] resources available
  - **Server Configuration**: [Name, version, description extraction]
  - **Authentication Integration**: [How auth is handled in MCP context]
- **How to Add New Tools**: [Step-by-step process with file locations]

### MCP Tool Implementations

#### Tool Categories & Organization
Based on detected tool files, analyze each category:

##### [Category 1] Tools - [filename]
- **Tools Available**:
  - `[tool_name_1]`: [Purpose and parameters]
  - `[tool_name_2]`: [Input/output schema details]
  - `[tool_name_3]`: [Error handling approach]
- **Implementation Pattern**: [Common pattern used across these tools]
- **Adding New Tools**: [How to extend this category]

[Repeat for each tool category detected]

## MCP Protocol Implementation Details

### Tool Registration Pattern Analysis
```javascript
// Extract actual registration pattern from code
server.registerTool(
  "[tool_name]",
  {
    title: "[title]",
    description: "[description]",
    inputSchema: [schema_type]
  },
  [handler_function]
);
```

### Input Validation Implementation
- **Schema Validation**: [Method used - Zod, JSON Schema, etc.]
- **Error Handling**: [How validation errors are returned]
- **Type Safety**: [TypeScript integration approach]

### Response Format Pattern
- **Success Response**: [Standard response structure]
- **Error Response**: [Error format and codes used]
- **Content Types**: [Supported response content types]

## MCP Client Integration Guide

### Connection Setup
```javascript
// Example client connection code
[Actual connection example based on implementation]
```

### Tool Usage Examples
For each major tool category, provide usage examples:

#### [Tool Category] Usage
```json
// Request format
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "[tool_name]",
    "arguments": {
      "[param1]": "[example_value]",
      "[param2]": "[example_value]"
    }
  }
}

// Response format
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[response_content]"
      }
    ]
  }
}
```

## MCP Resource Implementation (if applicable)

### Available Resources
- **[Resource 1]**: [URI pattern and content type]
- **[Resource 2]**: [Purpose and usage context]
- **[Resource 3]**: [Dynamic vs static content]

### Resource Access Examples
```javascript
// Resource retrieval examples
[Actual resource access patterns from code]
```

## MCP Server Architecture Patterns

### Tool Handler Pattern
```typescript
// Extract actual handler pattern from codebase
const toolHandler = async (args: ToolArgs, env: Environment, context: Context) => {
  // [Actual implementation pattern]
  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
};
```

### State Management Pattern
- **User Context**: [How user context is managed across tools]
- **Session State**: [Stateful vs stateless tool implementation]
- **Data Persistence**: [How tool data is persisted between calls]

### Error Handling Strategy
- **Validation Errors**: [How input validation failures are handled]
- **Runtime Errors**: [Error propagation and logging approach]
- **User-Friendly Messages**: [Error message formatting for clients]

## MCP Development Workflow

### Adding a New Tool - Step by Step
1. **Tool Definition**: [Where to define the tool schema]
2. **Handler Implementation**: [File location and pattern to follow]
3. **Registration**: [How to register in server configuration]
4. **Testing**: [How to test the new tool]
5. **Documentation**: [How tool documentation is maintained]

### Modifying Existing Tools
- **[Tool Type 1]**: [Location and modification approach]
- **[Tool Type 2]**: [Schema changes and backward compatibility]
- **[Tool Type 3]**: [Testing changes and validation]

### Tool Testing Approaches
```bash
# MCP-specific testing commands
[Unit test command for tools]
[Integration test for MCP protocol]
[Client simulation test command]
```

## MCP Protocol Compliance & Testing

### Protocol Validation
- **JSON-RPC 2.0**: [Compliance verification method]
- **MCP Specification**: [Version compatibility and features used]
- **Schema Validation**: [Tool input/output schema validation]

### Client Compatibility
- **Supported Clients**: [Known compatible MCP clients]
- **Testing Matrix**: [Client/server compatibility testing approach]
- **Protocol Extensions**: [Any custom extensions or modifications]

## MCP Server Deployment & Configuration

### Environment-Specific MCP Setup
- **Development**: [Local MCP server configuration]
- **Staging**: [Testing environment MCP setup]
- **Production**: [Production MCP server configuration]

### Authentication & Security
- **API Key Management**: [How API keys are validated for MCP access]
- **Request Validation**: [Security measures for tool calls]
- **Rate Limiting**: [If implemented, how rate limiting works]

### Monitoring & Debugging
```bash
# MCP server debugging commands
[Log viewing command]
[Protocol message debugging]
[Performance monitoring]
```

## MCP Integration Points

### External Service Integration
- **[Service 1]**: [How this service is integrated via MCP tools]
- **[Service 2]**: [Authentication and API calling patterns]
- **[Service 3]**: [Data transformation and response handling]

### Extension Architecture
- **Plugin System**: [If applicable, how to add new functionality]
- **Custom Tools**: [Architecture for domain-specific tools]
- **Resource Providers**: [How to add new resource types]

## Troubleshooting Common MCP Issues

### Connection Problems
- **[Issue 1]**: [Symptoms and resolution steps]
- **[Issue 2]**: [Common configuration mistakes]
- **[Issue 3]**: [Network/firewall considerations]

### Tool Execution Issues
- **Schema Validation Failures**: [How to debug and fix]
- **Runtime Errors**: [Common error patterns and solutions]
- **Performance Issues**: [Optimization strategies]

### Client Integration Issues
- **[Client Type 1]**: [Specific integration challenges and solutions]
- **[Client Type 2]**: [Configuration requirements]

## MCP Best Practices Implementation

### Tool Design Principles
- **[Principle 1]**: [How it's implemented in this codebase]
- **[Principle 2]**: [Examples from actual tool implementations]
- **[Principle 3]**: [Patterns for maintainable tool code]

### Performance Optimization
- **Tool Response Time**: [Optimization strategies used]
- **Memory Usage**: [Efficient data handling patterns]
- **Concurrent Requests**: [How multiple tool calls are handled]

### Maintainability Patterns
- **Code Organization**: [Tool file organization strategy]
- **Testing Strategy**: [MCP-specific testing approaches]
- **Documentation**: [Tool documentation maintenance]