#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo -e "${BLUE}🧪 Testing Knowledge Base Assistant APIs${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}1. Testing Health Check...${NC}"
HEALTH=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH" | grep -q "healthy"; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo "$HEALTH" | jq . 2>/dev/null || echo "$HEALTH"
else
  echo -e "${RED}✗ Health check failed${NC}"
  echo "$HEALTH"
fi

echo -e "\n${BLUE}─────────────────────────────────────${NC}\n"

# Test 2: Search (will fail if no data, but tests endpoint)
echo -e "${BLUE}2. Testing Search Endpoint...${NC}"
SEARCH=$(curl -s -X POST "${BASE_URL}/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "k": 3}')

if echo "$SEARCH" | grep -q "success"; then
  echo -e "${GREEN}✓ Search endpoint responding${NC}"
  echo "$SEARCH" | jq . 2>/dev/null || echo "$SEARCH"
else
  echo -e "${RED}✗ Search endpoint error${NC}"
  echo "$SEARCH"
fi

echo -e "\n${BLUE}─────────────────────────────────────${NC}\n"

# Test 3: Chat (will fail if no data, but tests endpoint)
echo -e "${BLUE}3. Testing Chat Endpoint...${NC}"
CHAT=$(curl -s -X POST "${BASE_URL}/chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this about?"}')

if echo "$CHAT" | grep -q "success"; then
  echo -e "${GREEN}✓ Chat endpoint responding${NC}"
  echo "$CHAT" | jq . 2>/dev/null || echo "$CHAT"
else
  echo -e "${RED}✗ Chat endpoint error${NC}"
  echo "$CHAT"
fi

echo -e "\n${BLUE}─────────────────────────────────────${NC}\n"

echo -e "${BLUE}✅ API Test Complete!${NC}"
echo -e "\n${BLUE}To ingest a URL, run:${NC}"
echo "curl -X POST ${BASE_URL}/admin/ingest -H 'Content-Type: application/json' -d '{\"url\": \"https://example.com\"}'"

