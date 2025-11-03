# Joe Code Review  
[https://github.com/j-bouchard/ai-fundraising](https://github.com/j-bouchard/ai-fundraising)  
  
## **Fundraising MCP Server Overview**  
This code is quite impressive for a proof of concept, especially considering it was created by someone who isn't primarily a programmer. It's a well-structured system that connects Salesforce (with NPSP - Nonprofit Success Pack) to an AI assistant through an MCP (Message Communication Protocol) server.  
  
**Key Components**  
1. **Salesforce Integration**  
    * OAuth 2.0 authentication with refresh token flow  
    * Methods to query and modify Salesforce data  
    * Error handling for API connections  
2. **Natural Language Processing**  
    * Converts conversational queries into Salesforce SOQL queries  
    * Pattern matching for amounts, timeframes, and donor segments  
    * Handles queries like "Who are our lapsed donors?" or "Show me major donors over $1000"  
3. **Donor Management Tools**  
    * Query different donor segments (lapsed, major, recent, first-time)  
    * Create/update Salesforce records  
    * Generate donor profiles  
    * Find prospects  
    * Log interactions  
4. **MCP Server**  
    * Exposes Salesforce operations as tools for an AI to use  
    * Async I/O patterns for better performance  
    * Caching to reduce API calls  
  
**Strengths**  
* Thoughtful error handling throughout  
* Consistent use of async/await patterns  
* Good code organization and documentation  
* Smart caching to avoid Salesforce API limits  
* Well-formatted, readable output for AI responses  
  
For a proof of concept, this follows many production-grade patterns while keeping the implementation focused on demonstrating capabilities. The developer clearly understands both fundraising workflows and software architecture principles.  
  
## My Notes:  
  
### Deployment and Libraries  
  
How does the Salesforce ecosystem work with external servers - do you need to install them in a particular way?  
  
Look at [FastMCP Cloud](https://gofastmcp.com/deployment/fastmcp-cloud) for hosting POC  
Look at [FastMCP 2.0 SDK ](https://github.com/jlowin/fastmcp)  
Look at CloudFlare as a production platform with [ModelFetch](https://www.modelfetch.com/), another great tool for Typescript based solution  
  
I don’t think FastMCP is available or running with this fallback.  
  
![• ine code tries to report raster our gracerutty nanaces its dosence](Attachments/CleanShot%202025-09-29%20at%2019.43.06.png)  
  
### Salesforce and MCP  
  
[Salesforce Connected Apps and MCP](https://developer.salesforce.com/blogs/2025/06/introducing-mcp-support-across-salesforce)  
  
Salesforce has announced comprehensive support for Model Context Protocol (MCP) across its ecosystem. MCP is an open-source protocol that simplifies the connection between AI applications and tools and data sources by eliminating the need for custom integration code for each tool.  
  
**Key Points:**  
1. MCP uses a client-server architecture with three main components:  
    * Host: AI applications like Claude, VSCode, or Agentforce  
    * Client: Operates within the host to communicate with MCP servers  
    * Server: Exposes capabilities and provides access to data, tools, and resources  
2. Salesforce is introducing three prebuilt MCP servers:  
    * Salesforce DX MCP Server (Developer Preview): Handles common development tasks using natural language  
    * Heroku Platform MCP Server (Generally Available): Manages Heroku apps and resources  
    * MuleSoft MCP Server (Generally Available): Manages MuleSoft projects  
3. Agentforce 3 will include a native MCP client (Pilot in July 2025), enabling secure connections to any MCP-compliant server without custom code. It will also provide an enterprise-grade server registry with policy enforcement.  
4. Additional capabilities announced include:  
    * Salesforce Hosted MCP Servers (in Pilot)  
    * MuleSoft's ability to convert any API to an MCP server  
    * Heroku support for hosting custom MCP servers with AppLink connection to Agentforce  
  
The article highlights Salesforce's emphasis on security and governance during the implementation of MCP, addressing key enterprise concerns regarding data protection and policy implementation.  
  
  
AI Funding Strategy : Original Document  
  
  
