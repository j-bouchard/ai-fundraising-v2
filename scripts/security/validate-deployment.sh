#!/bin/bash
# Resin Security Validator - DevOps Script
# Validates security claims for a Cloudflare Workers deployment
#
# Usage:
#   ./scripts/security/validate-deployment.sh resin
#   ./scripts/security/validate-deployment.sh evergreen
#   RESIN_API_KEY=your-key ./scripts/security/validate-deployment.sh resin

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Ensure we're in the repo root
cd "$REPO_ROOT"

# Check if worker argument provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Missing --worker argument${NC}"
    echo ""
    echo "Usage:"
    echo "  $0 <worker-name>"
    echo ""
    echo "Examples:"
    echo "  $0 resin"
    echo "  $0 evergreen"
    echo ""
    echo "Available workers are defined in tools/security/deployments.yaml"
    exit 1
fi

WORKER="$1"

echo -e "${BLUE}================================================${NC}"
echo "Resin Security Validator"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Worker: $WORKER"
echo "Repository: $REPO_ROOT"
echo ""

# Check for uv
if ! command -v uv &> /dev/null; then
    echo -e "${RED}Error: 'uv' not found${NC}"
    echo ""
    echo "Install uv from: https://docs.astral.sh/uv/"
    echo ""
    echo "macOS:"
    echo "  brew install uv"
    echo ""
    echo "Or globally:"
    echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Sync Python environment
echo -e "${BLUE}Installing Python dependencies...${NC}"
uv sync --quiet

# Run validator
echo ""
echo -e "${BLUE}Running validator for worker: $WORKER${NC}"
echo ""

uv run python tools/security/validator.py --worker "$WORKER"

echo ""
echo -e "${GREEN}✓ Validation complete${NC}"
echo ""
