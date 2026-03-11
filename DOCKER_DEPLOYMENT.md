# 🚀 Gasless Rollup Docker Deployment Guide

## Overview

This Docker setup automates the entire deployment pipeline:

1. ✅ **Install Rust/Cargo** - Required for Foundry
2. ✅ **Install Foundry** - Smart contract toolkit
3. ✅ **Build Contracts** - Compile Solidity with `forge build`
4. ✅ **Deploy Scripts** - Run `forge script Deploy.s.sol` with Sepolia
5. ✅ **Start Relayer** - Node.js API server (`node server.js`)
6. ✅ **Start Frontend** - React dev server (`npm run dev`)

## Quick Start

### Local Development

1. **Clone and setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   export SEPOLIA_RPC_URL="your_rpc_url"
   export PRIVATE_KEY="your_private_key"
   ```

2. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access services:**
   - Relayer API: `${import.meta.env.VITE_BACKEND_URL}`
   - Frontend Dev: `http://localhost:5173`
   - Frontend Alt: `http://localhost:3000`

### Manual Build (Advanced)

```bash
# Build with build arguments
docker build \
  --build-arg SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL \
  --build-arg PRIVATE_KEY=$PRIVATE_KEY \
  -t gasless-rollup:latest .

# Run
docker run -it \
  -p 3000:3000 \
  -p 4000:4000 \
  -p 5173:5173 \
  -e SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL \
  -e PRIVATE_KEY=$PRIVATE_KEY \
  -e CONTRACT_ADDRESS=$CONTRACT_ADDRESS \
  gasless-rollup:latest
```

## Dockerfile Stages Explained

### Build Stage: `foundry-builder`
```dockerfile
- Uses Node 20 Alpine base
- Installs Rust toolchain (required for Foundry)
- Installs Foundry CLI
- Builds contracts: forge build
- Runs deployment: forge script script/Deploy.s.sol
```

### Runtime Stage: Final
```dockerfile
- Clean Alpine Node 20 image
- Copies build artifacts from builder
- Installs Node dependencies for relayer
- Installs npm dependencies for frontend
- Runs docker-entrypoint.sh to start all services
```

## Deploy to Vercel

### Method 1: Direct Docker Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add SEPOLIA_RPC_URL
vercel env add PRIVATE_KEY
vercel env add CONTRACT_ADDRESS

# Deploy
vercel deploy
```

### Method 2: Railway (Recommended)

Railway better supports long-running processes:

```bash
npm i -g railway
railway login
railway init
railway up
```

### Method 3: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
flyctl auth login
flyctl launch
flyctl deploy
```

## Environment Variables

Required in `.env` or deployment platform:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_hex_private_key_without_0x
CONTRACT_ADDRESS=0x...  # Set after first deployment
NODE_ENV=production
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Relayer API | 4000 | `${import.meta.env.VITE_BACKEND_URL}` |
| Frontend Dev | 5173 | `http://localhost:5173` |
| Frontend | 3000 | `http://localhost:3000` |

## Health Checks

The container includes health checks:
```bash
Docker health check: ${import.meta.env.VITE_BACKEND_URL}/
Interval: 30s
Timeout: 10s
Retries: 3
```

## Troubleshooting

### Build Fails: "Foundry not found"
```bash
# Increase Docker build memory
docker-compose build --no-cache
```

### Ports Already in Use
```bash
# Change ports in docker-compose.yml
ports:
  - "4001:4000"  # Use 4001 instead
  - "3001:3000"
  - "5174:5173"
```

### Services Won't Start
```bash
# Check logs
docker-compose logs -f

# Specific service
docker-compose logs -f gasless-rollup
```

### Private Key Issues
- Verify no `0x` prefix
- Ensure valid hex string
- Check it's not exposed in logs

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment secrets for `PRIVATE_KEY`
- [ ] Set correct `CONTRACT_ADDRESS` after deployment
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts
- [ ] Configure backup strategy
- [ ] Test disaster recovery
- [ ] Document deployment process

## Advanced: Multi-stage Optimization

To create even smaller images:

```dockerfile
# Add to final stage
RUN npm ci --omit=dev --prefix relayer
RUN npm ci --omit=dev --prefix rollup-explorer-main
```

## Cleanup

```bash
# Stop containers
docker-compose down

# Remove containers
docker-compose down -v

# Remove images
docker rmi gasless-rollup:latest
```

## Support

For issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure Rust/Foundry installation in builder
4. Test services individually

## License

See PROJECT_ROOT/LICENSE
