#!/bin/bash

# Gasless Rollup Local Build & Deploy Script
# This script performs all 4 deployment tasks locally without Docker

set -e

echo "🚀 Gasless Rollup Build & Deploy Script"
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "   Please copy .env.example to .env and fill in your values"
    exit 1
fi

# Source environment variables
export $(cat .env | grep -v '#' | xargs)

# Verify required variables
if [ -z "$SEPOLIA_RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: Missing required environment variables${NC}"
    echo "   Please set SEPOLIA_RPC_URL and PRIVATE_KEY in .env"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# Task 1: Check Rust & Cargo
echo -e "${YELLOW}📦 Task 1: Checking Rust & Cargo...${NC}"
if ! command -v rustc &> /dev/null; then
    echo -e "${YELLOW}⚠️  Rust not found. Installing...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo -e "${GREEN}✅ Rust/Cargo found${NC}"
fi
echo ""

# Task 2: Check Foundry
echo -e "${YELLOW}📦 Task 2: Checking Foundry...${NC}"
if ! command -v forge &> /dev/null; then
    echo -e "${YELLOW}⚠️  Foundry not found. Installing...${NC}"
    curl -L https://foundry.paradigm.xyz | bash
    source $HOME/.bashrc
    /root/.foundry/bin/foundryup
else
    echo -e "${GREEN}✅ Foundry found${NC}"
fi
echo ""

# Task 3: Build & Deploy Contracts
echo -e "${YELLOW}🏗️  Task 3: Building Contracts with Forge...${NC}"
echo ""
forge build
echo ""
echo -e "${GREEN}✅ Contracts built!${NC}"
echo ""

echo -e "${YELLOW}📤 Task 3b: Deploying to Sepolia...${NC}"
echo ""
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Task 4: Install Dependencies
echo -e "${YELLOW}📥 Task 4a: Installing Relayer Dependencies...${NC}"
cd relayer
npm install
cd ..
echo -e "${GREEN}✅ Relayer dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📥 Task 4b: Installing Frontend Dependencies...${NC}"
cd rollup-explorer-main
npm install
cd ..
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Task 5: Start Services
echo -e "${GREEN}🎉 All build tasks complete!${NC}"
echo ""
echo "To start the services, run:"
echo "  npm run start:relayer    # Start relayer (port 4000)"
echo "  npm run start:frontend   # Start frontend (port 5173)"
echo ""
echo "Or run together:"
echo "  npm run start:all"
echo ""
