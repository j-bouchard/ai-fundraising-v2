#!/bin/bash
# run-fundraising-followup.sh
# Runner script for Fundraising Report Analysis recipe

set -euo pipefail

RECIPE_NAME="fundraising-data-analysis-followup"
RECIPE_PATH="mill/recipes/${RECIPE_NAME}.yaml"

# Default values
INPUT_FILE=""
OUTPUT_FILE=""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage function
usage() {
  cat <<EOF
${GREEN}Fundraising Report Analysis${NC}

Transform fundraising reports into actionable intelligence with time-aware
recommendations and data quality assessments.

${BLUE}USAGE:${NC}
  $0 --input REPORT_FILE [--output OUTPUT_FILE]

${BLUE}OPTIONS:${NC}
  --input FILE       Path to the fundraising report markdown file (required)
  --output FILE      Path where analysis should be saved (optional)
                     If not specified, saves alongside input file as *-analysis.md
  -h, --help         Show this help message

${BLUE}EXAMPLES:${NC}
  # Analyze a report (output will be saved as report-analysis.md)
  $0 --input reports/fundraising-data-analysis/2024-10-31-1400/report.md

  # Analyze with custom output location
  $0 --input reports/q4-2024/report.md --output analysis/q4-insights.md

${BLUE}WORKFLOW:${NC}
  1. Reads the saved fundraising report
  2. Validates data quality and completeness
  3. Extracts key metrics and trends
  4. Generates time-aware, prioritized action items
  5. Saves comprehensive analysis to output file

${BLUE}OUTPUT INCLUDES:${NC}
  • Executive Summary with key findings
  • Immediate Actions (this week)
  • Strategic Priorities (30-90 days)
  • Risk Monitoring indicators
  • Data Quality assessment

${BLUE}REQUIREMENTS:${NC}
  • Goose CLI installed (https://block.github.io/goose/)
  • Valid fundraising report markdown file

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

# If output not specified, create it alongside input with -analysis suffix
if [ -z "$OUTPUT_FILE" ]; then
  INPUT_DIR=$(dirname "$INPUT_FILE")
  INPUT_BASENAME=$(basename "$INPUT_FILE" .md)
  OUTPUT_FILE="${INPUT_DIR}/${INPUT_BASENAME}-analysis.md"
  echo -e "${YELLOW}No output specified, will save to: ${OUTPUT_FILE}${NC}"
fi

if [ ! -f "$RECIPE_PATH" ]; then
  echo -e "${RED}Error: Recipe file not found: $RECIPE_PATH${NC}"
  echo -e "Expected location: $(pwd)/$RECIPE_PATH"
  exit 1
fi

# Display configuration
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Fundraising Report Analysis Recipe                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Input:   ${INPUT_FILE}"
echo -e "  Output:  ${OUTPUT_FILE}"
echo -e "  Date:    $(date +%Y-%m-%d)"
echo -e "  Quarter: Q$(( ($(date +%-m)-1)/3+1 ))"
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

# Run the recipe
echo -e "${YELLOW}Running analysis recipe...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
echo ""

if eval $GOOSE_CMD; then
  # Check if output was created
  if [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✓ Analysis Complete!                       ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Report Details:${NC}"
    echo -e "  Location: ${OUTPUT_FILE}"

    # Display file size
    if command -v wc &> /dev/null; then
      FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
      FILE_LINES=$(wc -l < "$OUTPUT_FILE" | tr -d ' ')
      echo -e "  Size:     ${FILE_SIZE} bytes (${FILE_LINES} lines)"
    fi

    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "  1. Review the analysis: cat \"${OUTPUT_FILE}\""
    echo -e "  2. Share with stakeholders"
    echo -e "  3. Implement immediate actions"

  else
    echo -e "${RED}✗ Analysis failed - no output file created${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Recipe execution failed${NC}"
  exit 1
fi
