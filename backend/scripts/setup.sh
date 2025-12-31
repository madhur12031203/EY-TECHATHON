#!/bin/bash
# Setup script for Buyoh Backend

echo "Setting up Buyoh Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your configuration before continuing."
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if PostgreSQL is available
echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    echo "PostgreSQL found. Please ensure your database is created:"
    echo "  createdb buyoh_db"
    echo ""
    echo "Then run migrations:"
    echo "  npm run migrate"
else
    echo "PostgreSQL not found. Please install PostgreSQL and create the database."
fi

echo ""
echo "Setup complete! Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Create PostgreSQL database: createdb buyoh_db"
echo "3. Run migrations: npm run migrate"
echo "4. Start MCP server: npm run mcp-server (in separate terminal)"
echo "5. Start backend: npm run dev"

