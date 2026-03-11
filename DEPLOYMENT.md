# Vercel Deployment Configuration

## Prerequisites

1. Create a Vercel account at https://vercel.com
2. Have your Sepolia RPC URL and Private Key ready
3. Install Vercel CLI: `npm i -g vercel`

## Deployment Options

### Option 1: Docker Container Deployment (Recommended for Full Stack)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add SEPOLIA_RPC_URL
   vercel env add PRIVATE_KEY
   vercel env add CONTRACT_ADDRESS
   ```

3. **Deploy**
   ```bash
   vercel deploy
   ```

### Option 2: Separate Deployments (Relayer + Frontend)

Since Vercel's default support is for serverless functions, you may want to:

**For Relayer (Express Server):**
- Use Vercel's Node.js runtime or deploy as a Docker container
- Or use Railway, Render, or Fly.io (better for long-running processes)

**For Frontend:**
- Deploy to Vercel directly via GitHub integration (recommended)

### Option 3: Railway Deployment (Best for This Architecture)

Deploy to Railway instead for better support of long-running processes:

```bash
# Install Railway CLI
npm i -g railway

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Environment Variables Required

Create a `.env` file in the root with:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_hex
CONTRACT_ADDRESS=0x...
NODE_ENV=production
```

## Docker Build and Run Locally

```bash
# Build
docker build \
  --build-arg SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL \
  --build-arg PRIVATE_KEY=$PRIVATE_KEY \
  -t gasless-rollup .

# Run with docker-compose
docker-compose up --build
```

## Services Running

- **Relayer API**: Port 4000
- **Frontend Dev**: Port 5173
- **Frontend Build**: Port 3000

## Important Notes

⚠️ **Security Warning:** Never commit `.env` files with real private keys. Always use environment variable secrets in your deployment platform.

## Troubleshooting

### Port Already in Use
```bash
# Change port mapping in docker-compose.yml
- "4001:4000"  # Use 4001 instead of 4000
```

### Build Fails
- Ensure all dependencies are installed
- Check Rust/Cargo installation
- Verify Foundry is accessible

### Services Won't Start
- Check logs: `docker-compose logs -f`
- Verify environment variables are set
- Ensure ports are not blocked
