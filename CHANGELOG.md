# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-11-03

### Added

- Monorepo structure consolidating multiple projects (Resin MCP server and Mill workflow specifications)
- Comprehensive documentation guiding users to correct project locations
- Test utilities for ongoing security validation
- API key authentication requirement for all MCP server endpoints

### Changed

- Repository reorganized as professional monorepo supporting multiple projects
- Streamlined setup and deployment instructions

### Security

- MCP server endpoints now require secure API key authentication
- Unauthorized access attempts properly rejected with clear error messages
- API credentials securely stored in cloud infrastructure (not in code)
- Production deployment verified with comprehensive security testing

## [0.1.0] - 2025-10-28

### Added

- Initial release of Resin MCP server for Salesforce fundraising analytics
- Cloudflare Workers-based deployment
- SOQL query execution capabilities
- Donor segmentation and opportunity analytics tools
- OAuth 2.0 refresh token flow for Salesforce authentication
- Query caching (60 seconds) to reduce API calls

[0.2.0]: https://github.com/mpazaryna/resin/releases/tag/v0.2.0
