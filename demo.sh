#!/bin/bash

# SafeKey CLI Demo Script
# This script demonstrates the core functionality of SafeKey

echo "🛡️  SafeKey CLI Demo"
echo "==================="
echo ""

# Set up demo vault path
DEMO_VAULT="./demo-vault.json"
NODE_CMD="node dist/index.js"

echo "1. Initializing a new vault..."
echo "   Command: $NODE_CMD init --vault $DEMO_VAULT"
echo ""

echo "2. Adding secrets to the vault..."
echo "   Commands:"
echo "   - $NODE_CMD add API_KEY --vault $DEMO_VAULT"
echo "   - $NODE_CMD add DATABASE_URL --vault $DEMO_VAULT"
echo "   - $NODE_CMD add JWT_SECRET --vault $DEMO_VAULT"
echo ""

echo "3. Listing all secrets..."
echo "   Command: $NODE_CMD list --vault $DEMO_VAULT"
echo ""

echo "4. Getting a specific secret..."
echo "   Command: $NODE_CMD get API_KEY --vault $DEMO_VAULT --show"
echo ""

echo "5. Exporting secrets to .env format..."
echo "   Command: $NODE_CMD export --vault $DEMO_VAULT --format env --output demo.env"
echo ""

echo "6. Removing a secret..."
echo "   Command: $NODE_CMD remove JWT_SECRET --vault $DEMO_VAULT --force"
echo ""

echo "7. Final vault status..."
echo "   Command: $NODE_CMD list --vault $DEMO_VAULT --verbose"
echo ""

echo "To run this demo interactively:"
echo "1. npm run build"
echo "2. Follow the commands above manually"
echo "3. Use password: 'demo123' for demonstration"
echo ""

echo "Note: This is a demonstration script. In a real scenario, you would"
echo "enter your master password securely when prompted."
echo ""

echo "🔒 Security Features:"
echo "- AES-256-GCM encryption"
echo "- PBKDF2 key derivation (100,000 iterations)"
echo "- Secure memory management"
echo "- Offline-first architecture"
echo ""

echo "Happy secret managing! 🚀"
