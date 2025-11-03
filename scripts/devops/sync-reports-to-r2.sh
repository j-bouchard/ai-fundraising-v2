#!/bin/bash
#
# sync-reports-to-r2.sh - Sync local reports to Cloudflare R2 storage
#
# Usage:
#   ./scripts/devops/sync-reports-to-r2.sh [options]
#
# Options:
#   --dry-run          Show what would be synced without actually uploading
#   --recipe <name>    Sync only a specific recipe's reports
#   --today            Sync only today's reports
#   --date <YYYY-MM-DD> Sync reports from specific date
#   --help             Show this help message
#
# Prerequisites:
#   - rclone installed (https://rclone.org/install/)
#   - R2 remote configured in rclone (see setup instructions below)
#
# Setup R2 Remote (one-time):
#   rclone config create r2 s3 \
#     provider Cloudflare \
#     access_key_id YOUR_R2_ACCESS_KEY_ID \
#     secret_access_key YOUR_R2_SECRET_ACCESS_KEY \
#     endpoint https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPORTS_DIR="reports"
R2_REMOTE="r2"
R2_BUCKET="resin-reports"
DRY_RUN=""
RECIPE_FILTER=""
DATE_FILTER=""

# Change to repo root
cd "$(dirname "$0")/../.."

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN="--dry-run"
      shift
      ;;
    --recipe)
      RECIPE_FILTER="$2"
      shift 2
      ;;
    --today)
      DATE_FILTER="$(date +%Y-%m-%d)*"
      shift
      ;;
    --date)
      DATE_FILTER="$2*"
      shift 2
      ;;
    --help)
      head -n 30 "$0" | grep "^#" | sed 's/^# //' | sed 's/^#//'
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if rclone is installed
if ! command -v rclone &> /dev/null; then
    echo -e "${RED}Error: rclone is not installed${NC}"
    echo "Install with: curl https://rclone.org/install.sh | sudo bash"
    echo "Or visit: https://rclone.org/install/"
    exit 1
fi

# Check if R2 remote is configured
if ! rclone listremotes | grep -q "^${R2_REMOTE}:$"; then
    echo -e "${RED}Error: rclone remote '${R2_REMOTE}' is not configured${NC}"
    echo ""
    echo "Configure R2 remote with:"
    echo -e "${BLUE}rclone config create r2 s3 \\
  provider Cloudflare \\
  access_key_id YOUR_R2_ACCESS_KEY_ID \\
  secret_access_key YOUR_R2_SECRET_ACCESS_KEY \\
  endpoint https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com${NC}"
    echo ""
    echo "Or run 'rclone config' for interactive setup"
    exit 1
fi

# Check if reports directory exists
if [ ! -d "$REPORTS_DIR" ]; then
    echo -e "${RED}Error: Reports directory '$REPORTS_DIR' does not exist${NC}"
    exit 1
fi

# Build source path
SOURCE_PATH="$REPORTS_DIR/"
if [ -n "$RECIPE_FILTER" ]; then
    SOURCE_PATH="$REPORTS_DIR/$RECIPE_FILTER/"
    if [ ! -d "$SOURCE_PATH" ]; then
        echo -e "${RED}Error: Recipe directory '$SOURCE_PATH' does not exist${NC}"
        exit 1
    fi
fi

# Build rclone arguments
RCLONE_ARGS=(
    "--progress"
    "--stats-one-line"
    "--stats" "5s"
    "--transfers" "4"
)

if [ -n "$DRY_RUN" ]; then
    RCLONE_ARGS+=("$DRY_RUN")
    echo -e "${YELLOW}DRY RUN MODE - No files will be uploaded${NC}"
    echo ""
fi

if [ -n "$DATE_FILTER" ]; then
    RCLONE_ARGS+=("--include" "$DATE_FILTER/**")
    echo -e "${BLUE}Filtering reports by date: $DATE_FILTER${NC}"
    echo ""
fi

# Show what will be synced
echo -e "${GREEN}=== Cloudflare R2 Sync Configuration ===${NC}"
echo "Source:      $SOURCE_PATH"
echo "Destination: ${R2_REMOTE}:${R2_BUCKET}/"
echo "Filters:     ${DATE_FILTER:-none}"
echo ""

# Confirm if not dry-run
if [ -z "$DRY_RUN" ]; then
    read -p "Proceed with sync? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Sync cancelled"
        exit 0
    fi
fi

# Perform sync
echo -e "${GREEN}Starting sync...${NC}"
echo ""

rclone sync \
    "$SOURCE_PATH" \
    "${R2_REMOTE}:${R2_BUCKET}/" \
    "${RCLONE_ARGS[@]}" \
    --exclude ".DS_Store" \
    --exclude "*.gitkeep" \
    --exclude "README.md"

echo ""
echo -e "${GREEN}✓ Sync complete!${NC}"

# Show bucket contents summary
echo ""
echo -e "${BLUE}=== R2 Bucket Summary ===${NC}"
rclone size "${R2_REMOTE}:${R2_BUCKET}/" --json | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Total files: {data[\"count\"]}')
print(f'Total size:  {data[\"bytes\"] / 1024 / 1024:.2f} MB')
" 2>/dev/null || echo "Run 'rclone size ${R2_REMOTE}:${R2_BUCKET}/' to see bucket summary"

# Show recent uploads
echo ""
echo -e "${BLUE}=== Recent Uploads ===${NC}"
rclone lsl "${R2_REMOTE}:${R2_BUCKET}/" --max-depth 3 | tail -n 10

echo ""
echo -e "${GREEN}Done!${NC}"
