#!/bin/bash

# Test script for send-camp-organizer-invite edge function
# This helps debug email sending issues

echo "=========================================="
echo "Testing send-camp-organizer-invite Edge Function"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get anon key
echo -e "${BLUE}Step 1: Getting Supabase project info...${NC}"
ANON_KEY=$(npx supabase status | grep "anon key" | awk '{print $3}')

if [ -z "$ANON_KEY" ]; then
    echo -e "${YELLOW}Anon key not found from local Supabase.${NC}"
    echo -e "${YELLOW}Get your anon key from: https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/settings/api${NC}"
    read -p "Enter your anon key: " ANON_KEY
fi

echo -e "${GREEN}✓ Anon key found${NC}"
echo ""

# Test email
echo -e "${BLUE}Step 2: Enter test details...${NC}"
read -p "Enter test email address: " TEST_EMAIL
read -p "Enter inviter name (default: Test Admin): " INVITER_NAME
INVITER_NAME=${INVITER_NAME:-"Test Admin"}

# Generate test token
TEST_TOKEN="test-token-$(date +%s)"

echo ""
echo -e "${BLUE}Step 3: Calling edge function...${NC}"
echo "URL: https://jkfbqimwhjukrmgjsxrj.supabase.co/functions/v1/send-camp-organizer-invite"
echo "Email: $TEST_EMAIL"
echo "Inviter: $INVITER_NAME"
echo "Token: $TEST_TOKEN"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST https://jkfbqimwhjukrmgjsxrj.supabase.co/functions/v1/send-camp-organizer-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"token\": \"$TEST_TOKEN\",
    \"inviterName\": \"$INVITER_NAME\"
  }")

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "=========================================="
echo -e "${BLUE}Response:${NC}"
echo "=========================================="
echo "HTTP Code: $HTTP_CODE"
echo ""
echo "Body:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

# Check result
if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ SUCCESS! Email sent successfully${NC}"
        echo ""
        echo -e "${GREEN}Next steps:${NC}"
        echo "1. Check email inbox: $TEST_EMAIL"
        echo "2. Look for invitation email from FutureEdge"
        echo "3. If not in inbox, check spam folder"
    else
        echo -e "${YELLOW}⚠️  Edge function responded but email may not have sent${NC}"
        echo "Check the response body above for details"
    fi
else
    echo -e "${RED}❌ FAILED! Edge function returned error${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "1. RESEND_API_KEY not set or invalid"
    echo "2. FROM_EMAIL domain not verified in Resend"
    echo "3. Resend API rate limit exceeded"
    echo ""
    echo -e "${YELLOW}To fix:${NC}"
    echo "1. Verify RESEND_API_KEY is set:"
    echo "   npx supabase secrets list"
    echo ""
    echo "2. Check Resend dashboard:"
    echo "   https://resend.com/api-keys"
    echo ""
    echo "3. View edge function logs in Supabase dashboard:"
    echo "   https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}Debugging Tips:${NC}"
echo "=========================================="
echo ""
echo "1. Check Supabase secrets are set:"
echo "   npx supabase secrets list"
echo ""
echo "2. View edge function logs:"
echo "   Go to: https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions"
echo "   Click on 'send-camp-organizer-invite'"
echo "   Click 'Logs' tab"
echo ""
echo "3. Check Resend API status:"
echo "   Login to: https://resend.com"
echo "   Check API Keys are active"
echo "   Check sending domain is verified"
echo ""
echo "4. Test with browser console:"
echo "   Open browser console when creating invite"
echo "   Look for console.log messages showing edge function response"
echo ""
