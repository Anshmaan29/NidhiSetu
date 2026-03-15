#!/bin/bash

# Quick setup script for SIH blockchain integration
echo "🚀 Setting up Nidhisetu Blockchain Integration for SIH..."

# Navigate to blockchain directory
cd blockchain

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please add your private key to .env file before deploying!"
else
    echo "✅ Environment file already exists"
fi

# Compile smart contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps for SIH demo:"
echo "1. Install MetaMask browser extension"
echo "2. Add Mumbai testnet to MetaMask"
echo "3. Get test MATIC from polygon faucet"
echo "4. Add your private key to .env file"
echo "5. Run: npm run deploy"
echo "6. Update contract addresses in web3-integration.js"
echo ""
echo "📖 See SIH-DEMO-GUIDE.md for complete demo instructions"