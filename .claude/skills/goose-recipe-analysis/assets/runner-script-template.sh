#!/bin/bash
# run-RECIPE_NAME.sh
# Runner script for RECIPE_TITLE analysis recipe
#
# Location: scripts/mill/run-RECIPE_NAME.sh
# Run from repo root: ./scripts/mill/run-RECIPE_NAME.sh

set -euo pipefail

RECIPE_NAME="RECIPE_NAME"
RECIPE_PATH="mill/recipes/${RECIPE_NAME}.yaml"

# Default values
INPUT_FILE=""
OUTPUT_FILE="RECIPE_NAME-output.md"
CONTEXT_INFO=""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage function
usage() {
  cat <<EOF
${GREEN}RECIPE_TITLE${NC}

DESCRIPTION

OPTIONS:
  --input FILE       Path to the document/report to analyze (required)
  --output FILE      Path where analysis should be saved (default: ${OUTPUT_FILE})
  --context TEXT     Additional context or constraints for the analysis
  -h, --help         Show this help message

EXAMPLES:
  # Basic analysis
  $0 --input reports/my-report.md

  # With custom output location
  $0 --input reports/my-report.md --output analysis/insights.md

  # With additional context
  $0 --input reports/my-report.md --context "Focus on Q4 performance"

WORKFLOW:
  1. Reads the input document
  2. Applies the analysis framework
  3. Generates actionable recommendations
  4. Saves analysis to output file

REQUIREMENTS:
  - Goose CLI installed (https://block.github.io/goose/)
  - Valid input document at specified path
EOF
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --input)
      INPUT_FILE="$2"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --context)
      CONTEXT_INFO="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo -e "${RED}Error: Unknown option: $1${NC}"
      usage
      ;;
  esac
done

# Validate required parameters
if [ -z "$INPUT_FILE" ]; then
  echo -e "${RED}Error: --input is required${NC}"
  usage
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo -e "${RED}Error: Input file does not exist: $INPUT_FILE${NC}"
  exit 1
fi

if [ ! -f "$RECIPE_PATH" ]; then
  echo -e "${RED}Error: Recipe file not found: $RECIPE_PATH${NC}"
  exit 1
fi

# Display configuration
echo -e "${GREEN}Starting analysis...${NC}"
echo -e "Input:   ${INPUT_FILE}"
echo -e "Output:  ${OUTPUT_FILE}"
if [ -n "$CONTEXT_INFO" ]; then
  echo -e "Context: ${CONTEXT_INFO}"
fi
echo ""

# Create output directory if needed
OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir -p "$OUTPUT_DIR"
  echo -e "${YELLOW}Created output directory: ${OUTPUT_DIR}${NC}"
fi

# Build goose command
GOOSE_CMD="goose run --recipe \"$RECIPE_PATH\""
GOOSE_CMD="$GOOSE_CMD --params input_file=\"$INPUT_FILE\""
GOOSE_CMD="$GOOSE_CMD --params output_file=\"$OUTPUT_FILE\""

if [ -n "$CONTEXT_INFO" ]; then
  GOOSE_CMD="$GOOSE_CMD --params context_info=\"$CONTEXT_INFO\""
fi

# Run the recipe
echo -e "${YELLOW}Running analysis recipe...${NC}"
eval $GOOSE_CMD

# Check if output was created
if [ -f "$OUTPUT_FILE" ]; then
  echo -e "${GREEN}✓ Analysis complete!${NC}"
  echo -e "Report saved to: ${OUTPUT_FILE}"

  # Display file size
  FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
  echo -e "File size: ${FILE_SIZE} bytes"
else
  echo -e "${RED}✗ Analysis failed - no output file created${NC}"
  exit 1
fi
