#!/bin/bash

# Fundraising Data Analysis Runner
# This script executes the fundraising data analysis Goose recipe

set -e  # Exit on error

# Set API key directly
export RESIN_API_KEY='igtcRlUi6YF2GGboiHrKRxUeVEXITDOo'

# Default parameters
ANALYSIS_PERIOD="${ANALYSIS_PERIOD:-current year}"
OUTPUT_FILE="${OUTPUT_FILE:-./fundraising-analysis-report.md}"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --period)
      ANALYSIS_PERIOD="$2"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --explain)
      goose run --recipe mill/recipes/fundraising-data-analysis.yaml --explain
      exit 0
      ;;
    --render)
      goose run --recipe mill/recipes/fundraising-data-analysis.yaml \
        --params analysis_period="$ANALYSIS_PERIOD" \
        --params output_file="$OUTPUT_FILE" \
        --render-recipe
      exit 0
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --period <PERIOD>    Analysis period (default: 'current year')"
      echo "                       Examples: 'last 12 months', '2024', 'Q4 2024'"
      echo "  --output <FILE>      Output file path (default: './fundraising-analysis-report.md')"
      echo "  --explain            Show recipe details without running"
      echo "  --render             Render the recipe template without executing"
      echo "  --help               Show this help message"
      echo ""
      echo "Environment variables:"
      echo "  RESIN_API_KEY        API key for Resin MCP server (required)"
      echo "  ANALYSIS_PERIOD      Default analysis period"
      echo "  OUTPUT_FILE          Default output file path"
      echo ""
      echo "Examples:"
      echo "  $0"
      echo "  $0 --period 'last 12 months' --output reports/2024.md"
      echo "  ANALYSIS_PERIOD='Q4 2024' $0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run '$0 --help' for usage information"
      exit 1
      ;;
  esac
done

# Run the recipe
echo "Running fundraising data analysis..."
echo "Period: $ANALYSIS_PERIOD"
echo "Output: $OUTPUT_FILE"
echo ""

# Note: The --with-streamable-http-extension flag doesn't support custom headers
# We need to use a different approach - pass the MCP server URL as a parameter
# and have the recipe instructions guide the agent to use available tools

goose run --recipe mill/recipes/fundraising-data-analysis.yaml \
  --params analysis_period="$ANALYSIS_PERIOD" \
  --params output_file="$OUTPUT_FILE" \
  --params RESIN_API_KEY="$RESIN_API_KEY"

echo ""
echo "Analysis complete! Report saved to: $OUTPUT_FILE"
