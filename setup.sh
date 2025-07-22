#!/bin/bash

echo "🚀 Charity Donations Platform Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null
then
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "Please install MongoDB and ensure it's running before proceeding."
    echo ""
    echo "MongoDB installation guides:"
    echo "- Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/"
    echo "- macOS: brew install mongodb/brew/mongodb-community"
    echo "- Linux: https://docs.mongodb.com/manual/administration/install-on-linux/"
    echo ""
else
    echo "✅ MongoDB is installed"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB service on your system"
echo "2. Run: node scripts/seedDatabase.js (to create initial data)"
echo "3. Run: npm run dev (to start both frontend and backend)"
echo ""
echo "🌐 Access the application:"
echo "- Public site: http://localhost:3000"
echo "- Admin panel: http://localhost:3000/admin/login"
echo "- Admin credentials: username=admin, password=admin123"
echo ""
echo "🎉 Happy coding!"