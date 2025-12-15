#!/bin/bash

# Deploy Script for Camp Organizer Invite System
# This script deploys the database changes and edge function

set -e  # Exit on error

echo "========================================"
echo "Camp Organizer Invite System Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if logged in to Supabase
echo -e "${BLUE}Step 1: Checking Supabase login status...${NC}"
if ! npx supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Supabase. Logging in...${NC}"
    npx supabase login
else
    echo -e "${GREEN}✓ Already logged in to Supabase${NC}"
fi
echo ""

# Step 2: Link to project (if not already linked)
echo -e "${BLUE}Step 2: Linking to Supabase project...${NC}"
if [ ! -f ".git/config" ] || ! grep -q "jkfbqimwhjukrmgjsxrj" ".git/config" 2>/dev/null; then
    echo -e "${YELLOW}Linking project...${NC}"
    npx supabase link --project-ref jkfbqimwhjukrmgjsxrj
else
    echo -e "${GREEN}✓ Project already linked${NC}"
fi
echo ""

# Step 3: Run database migrations
echo -e "${BLUE}Step 3: Running database migrations...${NC}"
echo -e "${YELLOW}This will update the camp_organizer_invites table to make organisation_id optional${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase db push
    echo -e "${GREEN}✓ Database migrations applied${NC}"
else
    echo -e "${RED}Skipped database migrations${NC}"
fi
echo ""

# Step 4: Deploy edge function
echo -e "${BLUE}Step 4: Deploying edge function 'send-camp-organizer-invite'...${NC}"
echo -e "${YELLOW}This edge function sends invitation emails via Resend${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase functions deploy send-camp-organizer-invite
    echo -e "${GREEN}✓ Edge function deployed${NC}"
else
    echo -e "${RED}Skipped edge function deployment${NC}"
fi
echo ""

# Step 5: Set environment variables
echo -e "${BLUE}Step 5: Setting up environment variables...${NC}"
echo ""
echo -e "${YELLOW}You need to set the following secrets:${NC}"
echo "  - RESEND_API_KEY (required)"
echo "  - FROM_EMAIL (optional, default: FutureEdge <noreply@futureedge.com>)"
echo "  - APP_URL (optional, default: http://localhost:5173)"
echo ""
read -p "Do you want to set these now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your Resend API key (starts with 're_'): " RESEND_KEY
    npx supabase secrets set RESEND_API_KEY="$RESEND_KEY"

    echo ""
    read -p "Enter FROM_EMAIL (press Enter to use default): " FROM_EMAIL_INPUT
    if [ -n "$FROM_EMAIL_INPUT" ]; then
        npx supabase secrets set FROM_EMAIL="$FROM_EMAIL_INPUT"
    fi

    echo ""
    read -p "Enter APP_URL (press Enter to use default): " APP_URL_INPUT
    if [ -n "$APP_URL_INPUT" ]; then
        npx supabase secrets set APP_URL="$APP_URL_INPUT"
    fi

    echo -e "${GREEN}✓ Environment variables set${NC}"
else
    echo -e "${YELLOW}Skipped environment setup${NC}"
    echo -e "${YELLOW}You can set secrets later with:${NC}"
    echo "  npx supabase secrets set RESEND_API_KEY=your_key"
    echo "  npx supabase secrets set FROM_EMAIL=\"Your App <noreply@yourdomain.com>\""
    echo "  npx supabase secrets set APP_URL=https://yourapp.com"
fi
echo ""

# Step 6: Regenerate TypeScript types
echo -e "${BLUE}Step 6: Regenerating TypeScript types...${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx supabase gen types typescript --project-id jkfbqimwhjukrmgjsxrj > src/lib/database.types.ts
    echo -e "${GREEN}✓ TypeScript types regenerated${NC}"
else
    echo -e "${RED}Skipped type generation${NC}"
fi
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. If you haven't set up Resend yet, sign up at https://resend.com"
echo "2. Get your API key from Resend dashboard"
echo "3. Set the RESEND_API_KEY secret if you haven't already"
echo "4. Test the invite system by creating an invitation"
echo ""
echo -e "${BLUE}Testing:${NC}"
echo "1. Log in as super_admin"
echo "2. Go to Admin Dashboard → Camp Organizer Management"
echo "3. Click 'Invite Camp Organizer'"
echo "4. Enter an email address"
echo "5. Click 'Send Invitation'"
echo "6. Check the email inbox for the invitation"
echo ""
echo -e "${GREEN}Documentation:${NC}"
echo "- Setup guide: supabase/functions/send-camp-organizer-invite/README.md"
echo "- Changes overview: CAMP_ORGANIZER_INVITE_UPDATES.md"
echo ""
