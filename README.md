# Digital Filing System - Frontend

A React TypeScript frontend for the Digital Filing System, providing a modern web interface for Kenyan teachers to manage and share educational documents.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Secure login with JWT
- **Document Management**: Upload, organize, preview, and share documents
- **File Validation**: Client-side validation for file types and sizes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Component Library**: Radix UI for accessible components
- **Form Handling**: React Hook Form with Zod validation
- **Charts & Analytics**: Recharts for data visualization

## Tech Stack

- **Framework**: React 18.3+
- **Language**: TypeScript 5.0+
- **Build Tool**: Vite 7.1+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI (Headless components)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Routing**: React Router 6+
- **HTTP Client**: Native fetch API
- **Date Handling**: date-fns
- **Animations**: Framer Motion

## System Requirements

### Minimum Requirements
- **Node.js**: 18.0 or higher
- **Package Manager**: pnpm 10.14+ (recommended) or npm 9+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 1GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Requirements
- **Node.js**: 20.0+
- **RAM**: 8GB or more
- **Storage**: 5GB+ for development
- **Browser**: Latest version of Chrome, Firefox, Safari, or Edge

## Installation

### Windows

#### Prerequisites
1. **Install Node.js 18+**:
   - Download from [nodejs.org](https://nodejs.org/download/)
   - Choose the LTS version
   - Verify installation: `node --version` and `npm --version`

2. **Install Git**:
   - Download from [git-scm.com](https://git-scm.com/download/win)

3. **Install pnpm** (recommended) or use npm:
   ```cmd
   npm install -g pnpm
   ```

#### Setup
```cmd
# Clone the repository
git clone https://github.com/your-username/dfs-frontend.git
cd dfs-frontend

# Install dependencies
pnpm install
# or with npm: npm install

# Copy environment file
copy .env.example .env.local

# Edit environment file
notepad .env.local

# Start development server
pnpm dev
# or with npm: npm run dev
```

### macOS

#### Prerequisites
1. **Install Homebrew**:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node@20
   ```

3. **Install pnpm**:
   ```bash
   npm install -g pnpm
   ```

#### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/dfs-frontend.git
cd dfs-frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Edit environment file
nano .env.local

# Start development server
pnpm dev
```

### Linux

#### Prerequisites (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt install build-essential

# Install pnpm
npm install -g pnpm

# Install Git
sudo apt install git
```

#### Prerequisites (CentOS/RHEL/Fedora)
```bash
# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs npm

# Install development tools
sudo dnf groupinstall "Development Tools"

# Install pnpm
npm install -g pnpm
```

#### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/dfs-frontend.git
cd dfs-frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Edit environment file
nano .env.local

# Start development server
pnpm dev
```

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info

# Site Configuration
VITE_SITE_NAME=Digital Filing System
VITE_SITE_DESCRIPTION=Kenya Teacher Document Management System

# Optional: Builder.io integration
VITE_PUBLIC_BUILDER_KEY=__BUILDER_PUBLIC_KEY__

# Development ping message
PING_MESSAGE=ping pong
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_SITE_NAME` | Application name | `Digital Filing System` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_TIMEOUT` | API request timeout in ms | `10000` |
| `VITE_DEBUG_MODE` | Enable debug mode | `true` |
| `VITE_LOG_LEVEL` | Logging level | `info` |

## Development

### Development Server
```bash
# Start development server (runs on localhost:8080)
pnpm dev

# Start with specific host/port (default is localhost:8080)
pnpm dev --host 0.0.0.0 --port 8080
```

### Available Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm dev:host         # Start dev server accessible from network

# Building
pnpm build           # Build for production
pnpm build:client    # Build client only
pnpm build:server    # Build server only
pnpm start           # Start production server

# Testing & Quality
pnpm test            # Run tests
pnpm typecheck       # TypeScript type checking
pnpm format.fix      # Format code with Prettier
```

## Building for Production

### Build Commands
```bash
# Build for production
pnpm build

# Preview production build locally
pnpm start

# Build individual parts
pnpm build:client    # Build client-side only
pnpm build:server    # Build server-side only
```

The build creates a `dist/` folder with:
- `dist/spa/` - Client-side application files
- `dist/server/` - Server-side build files (if using SSR)
- Optimized and minified JavaScript/CSS
- Static assets with hash-based filenames

## Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version (should be 18+)
node --version

# Use Node Version Manager (nvm) if needed
# Install nvm first, then:
nvm install 20
nvm use 20
```

#### Package Installation Issues
```bash
# Clear cache and reinstall with pnpm
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or with npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
The development server runs on port 8080 by default.
```bash
# Kill process on port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9

# Or use a different port
pnpm dev --port 3000
```

#### Build Issues
```bash
# Check for TypeScript errors
pnpm typecheck

# Clear Vite cache
rm -rf node_modules/.vite

# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

#### Backend Connection Issues
Make sure the backend is running on `http://localhost:8000` and check:
- Backend server is running
- `VITE_API_BASE_URL` is correctly set to `http://localhost:8000/api`
- No CORS issues (backend should allow `http://localhost:8080`)

#### Environment Variable Issues
```bash
# Check if variables are loaded (in browser console)
console.log(import.meta.env.VITE_API_BASE_URL);

# Ensure variables start with VITE_
# Restart dev server after changing .env
```

### Development Tips
```bash
# View all environment variables
console.log(import.meta.env);

# Check Vite configuration
cat vite.config.ts

# Inspect network requests in browser DevTools
# Check if API calls are going to correct backend URL
```

---

**Digital Filing System Frontend - Setup and Local Development Guide**
