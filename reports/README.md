# Reports Directory

This directory stores reports generated from Goose recipe executions. Reports are organized by recipe name and date for easy access and future deployment to Cloudflare R2.

## Structure

```
reports/
├── fundraising-data-analysis/
│   └── YYYY-MM-DD-HHMM/
│       ├── report.md           # Main report output
│       ├── metadata.json       # Execution metadata
│       └── data.json          # Raw data (optional)
└── other-recipe-name/
    └── YYYY-MM-DD-HHMM/
        └── report.md
```

## Usage

Reports are automatically generated when running Goose recipes:

```bash
# Run a recipe (generates report in reports/recipe-name/YYYY-MM-DD-HHMM/)
./mill/run-fundraising-data-analysis.sh
```

## Metadata Format

Each report should include a `metadata.json` file:

```json
{
  "recipe": "fundraising-data-analysis",
  "executed_at": "2025-11-03T10:30:00Z",
  "duration_seconds": 45,
  "goose_version": "0.9.0",
  "status": "success",
  "parameters": {
    "api_key": "[redacted]"
  }
}
```

## Cloudflare R2 Deployment

Reports in this directory are stored locally for review. In production, reports will be automatically uploaded to Cloudflare R2 storage:

**Local path:**
`reports/fundraising-data-analysis/2025-11-03-1430/report.md`

**R2 bucket path:**
`s3://resin-reports/fundraising-data-analysis/2025-11-03-1430/report.md`

### Future R2 Sync Script

```bash
# Upload today's reports to R2
rclone sync reports/ r2:resin-reports/ \
  --include "$(date +%Y-%m-%d)*/**" \
  --progress

# Or use Cloudflare's R2 CLI
wrangler r2 object put resin-reports/fundraising-data-analysis/2025-11-03-1430/report.md \
  --file reports/fundraising-data-analysis/2025-11-03-1430/report.md
```

## Sample Reports

For documentation and examples, see the `reports-sample/` directory at the repository root. These samples are committed to git, while working reports in this directory are gitignored.

## Cleanup

Local reports can be cleaned up periodically:

```bash
# Remove reports older than 30 days
find reports/ -type d -name "2*" -mtime +30 -exec rm -rf {} +
```
