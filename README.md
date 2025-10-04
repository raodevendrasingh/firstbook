<div align="center">
  <img src="src/assets/brand/firstbook_logo.svg" alt="FirstbookLM Logo" width="120" height="120">
  <h1>FirstbookLM</h1>
</div>

FirstbookLM is an AI-powered notebook application that allows you to create, manage, and interact with your documents through intelligent chat interfaces. Built with Next.js, it features file uploads, vector search, and support for multiple AI providers.

## Features

- 🤖 **Multi-AI Provider Support** - OpenAI, Anthropic, Google Gemini
- 📁 **File Upload & Processing** - PDF, Word, text files with automatic content extraction
- 🔍 **Vector Search** - Semantic search through your documents using embeddings
- 💬 **Intelligent Chat** - Context-aware conversations with your documents
- 🔐 **Authentication** - Google OAuth and email/password authentication
- ☁️ **File Storage** - Cloudflare R2 integration for file storage
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **AI**: Vercel AI SDK with multiple providers
- **Storage**: Cloudflare R2 (S3-compatible)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun
- **Vector Search**: pgvector

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher - required for React 19)
- [Bun](https://bun.sh/) (recommended package manager)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher with pgvector extension)
- [Git](https://git-scm.com/)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/raodevendrasingh/firstbook.git

   cd firstbook
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Enable pgvector extension in your PostgreSQL database
   bun run db:push
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/firstbook"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Optional Variables

```env
# AI Providers (at least one required for AI features)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"

# Search Provider
EXASEARCH_API_KEY="your-exa-search-api-key"

# File Storage (Cloudflare R2)
R2_S3_API_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_PUBLIC_ACCESS_URL="https://your-custom-domain.com"
R2_PUBLIC_BUCKET="firstbook"

# Environment
NODE_ENV="development"
```

## Detailed Setup Guide

### 1. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** with pgvector extension:
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS (with Homebrew)
   brew install postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Install pgvector extension**:
   ```bash
   # Ubuntu/Debian (PostgreSQL 14+)
   sudo apt install postgresql-14-pgvector
   # or for PostgreSQL 15+
   sudo apt install postgresql-15-pgvector
   
   # macOS
   brew install pgvector
   ```

3. **Create database and enable extension**:
   ```sql
   CREATE DATABASE firstbook;
   \c firstbook;
   CREATE EXTENSION vector;
   ```

#### Option B: Cloud Database (Recommended)

**Neon (Recommended)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `DATABASE_URL`
4. Enable pgvector in the SQL editor:
   ```sql
   CREATE EXTENSION vector;
   ```

**Supabase**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to your `DATABASE_URL`
5. Enable pgvector in the SQL editor:
   ```sql
   CREATE EXTENSION vector;
   ```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity API)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env.local`

### 3. AI Provider Setup

#### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create a new API key
4. Add to `OPENAI_API_KEY` in `.env.local`

#### Anthropic
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys section
3. Create a new API key
4. Add to `ANTHROPIC_API_KEY` in `.env.local`

#### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Add to `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`

### 4. File Storage Setup (Cloudflare R2)

1. Sign up at [Cloudflare](https://cloudflare.com)
2. Go to R2 Object Storage
3. Create a new bucket
4. Go to "Manage R2 API tokens"
5. Create a new API token with R2 permissions
6. Set up a custom domain (optional but recommended)
7. Add credentials to your `.env.local`:
   ```env
   R2_S3_API_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   R2_ACCESS_KEY_ID="your-access-key"
   R2_SECRET_ACCESS_KEY="your-secret-key"
   R2_PUBLIC_ACCESS_URL="https://your-custom-domain.com"
   R2_PUBLIC_BUCKET="your-bucket-name"
   ```

### 5. Search Provider Setup (Optional)

1. Sign up at [exa.ai](https://exa.ai)
2. Get your API key
3. Add to `EXASEARCH_API_KEY` in `.env.local`

## Database Migrations

After setting up your database, run the migrations:

```bash
# Generate migration files (if needed)
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Or push schema directly (for development)
bun run db:push
```

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Format code
bun run format

# Fix linting issues
bun run fix

# Clean build artifacts
bun run clean

# Database operations
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio
```

## Production Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- `DATABASE_URL` - Your production PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Production OAuth credentials
- AI provider API keys
- R2 storage credentials (if using file uploads)

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check if pgvector extension is installed

2. **Authentication not working**
   - Verify Google OAuth credentials
   - Check redirect URIs match your domain
   - Ensure `NEXT_PUBLIC_APP_URL` is set correctly

3. **File upload issues**
   - Verify R2 credentials are correct
   - Check bucket permissions
   - Ensure custom domain is properly configured

4. **AI features not working**
   - Verify at least one AI provider API key is set
   - Check API key permissions and quotas
   - Ensure proper model access

### Getting Help

- Check the [Issues](https://github.com/raodevendrasingh/firstbook/issues) page
- Review the [Next.js documentation](https://nextjs.org/docs)
- Check [Better Auth documentation](https://www.better-auth.com)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

