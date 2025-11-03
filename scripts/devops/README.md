# DevOps Scripts

This directory contains operational scripts for managing the Resin project infrastructure.

## Available Scripts

### sync-reports-to-r2.sh

Syncs local report files to Cloudflare R2 storage for production hosting.

**Prerequisites:**
- [rclone](https://rclone.org/install/) installed
- R2 remote configured (see setup below)

**Usage:**
```bash
# Sync all reports
./scripts/devops/sync-reports-to-r2.sh

# Dry run (preview what would be synced)
./scripts/devops/sync-reports-to-r2.sh --dry-run

# Sync only a specific recipe
./scripts/devops/sync-reports-to-r2.sh --recipe fundraising-data-analysis

# Sync only today's reports
./scripts/devops/sync-reports-to-r2.sh --today

# Sync reports from specific date
./scripts/devops/sync-reports-to-r2.sh --date 2024-10-30

# Combine options
./scripts/devops/sync-reports-to-r2.sh --recipe fundraising-data-analysis --today --dry-run
```

**First-Time Setup:**

1. **Install rclone:**
   ```bash
   curl https://rclone.org/install.sh | sudo bash
   ```

2. **Get R2 credentials:**
   - Log in to Cloudflare Dashboard
   - Navigate to R2 → Manage R2 API Tokens
   - Create API token with read/write permissions
   - Note: Account ID, Access Key ID, Secret Access Key

3. **Configure rclone remote:**
   ```bash
   rclone config create r2 s3 \
     provider Cloudflare \
     access_key_id YOUR_R2_ACCESS_KEY_ID \
     secret_access_key YOUR_R2_SECRET_ACCESS_KEY \
     endpoint https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
   ```

   Or use interactive setup:
   ```bash
   rclone config
   ```

4. **Create R2 bucket:**
   ```bash
   rclone mkdir r2:resin-reports
   ```

5. **Test connection:**
   ```bash
   rclone lsd r2:
   ```

**Examples:**

```bash
# Preview sync without making changes
./scripts/devops/sync-reports-to-r2.sh --dry-run

# Sync only today's reports
./scripts/devops/sync-reports-to-r2.sh --today

# Sync specific recipe reports
./scripts/devops/sync-reports-to-r2.sh --recipe fundraising-data-analysis

# Sync historical reports from specific date
./scripts/devops/sync-reports-to-r2.sh --date 2024-10-30
```

**What Gets Synced:**

The script syncs all files in `reports/` except:
- `.DS_Store` files
- `.gitkeep` files
- `README.md` files

**Path Mapping:**
```
Local:  reports/fundraising-data-analysis/2024-10-30-1400/report.md
R2:     s3://resin-reports/fundraising-data-analysis/2024-10-30-1400/report.md
```

## Future Scripts

Additional scripts planned for this directory:

- `deploy-resin.sh` - Automated Resin MCP server deployment
- `backup-salesforce.sh` - Backup Salesforce metadata
- `cleanup-old-reports.sh` - Remove local reports older than N days
- `setup-r2-bucket.sh` - Automated R2 bucket creation and configuration

## Contributing

When adding new scripts:

1. Make them executable: `chmod +x script-name.sh`
2. Include usage documentation in the script header
3. Add error handling and input validation
4. Use color output for better UX
5. Document the script in this README

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [rclone Documentation](https://rclone.org/docs/)
- [rclone Cloudflare R2 Guide](https://rclone.org/s3/#cloudflare-r2)
