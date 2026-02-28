# Mini Library Management System - Backend API

A production-ready REST API for managing a mini library system built with **Express**, **TypeScript**, **Prisma**, and **SQLite**. Features book CRUD, check-in/check-out workflows, AI-powered metadata suggestions, RBAC authentication, and professional Swagger/OpenAPI documentation.

## Tech Stack

- **Runtime**: Node.js 20+ / TypeScript 5.7
- **Framework**: Express 4.21
- **Database**: SQLite via Prisma 6 ORM
- **Validation**: Zod
- **Docs**: Swagger UI (swagger-ui-express) at `/api/docs`
- **Auth**: OIDC/JWKS (production) + Dev JWT (development)
- **Security**: Helmet 8, CORS, compression
- **Testing**: Jest + ts-jest
- **Dev server**: tsx (watch mode)
- **Deployment**: SSH to EC2 + systemd

## Project Structure

```
src/
├── index.ts               # Entry point (server bootstrap)
├── app.ts                 # Express app factory
├── config.ts              # Environment configuration
├── errors.ts              # Custom error classes
├── prisma.ts              # Prisma client singleton
├── swagger.ts             # OpenAPI 3.0 spec definition
├── middleware/
│   ├── auth.ts            # JWT authentication (OIDC + dev mode)
│   ├── roles.ts           # RBAC role guard
│   ├── validate.ts        # Zod body/query validation
│   ├── request-id.ts      # X-Request-ID middleware
│   └── error-handler.ts   # Global error handler
├── routes/
│   ├── auth.routes.ts     # POST /auth/dev-login, GET /me
│   ├── books.routes.ts    # Book CRUD + checkout/checkin
│   ├── ai.routes.ts       # AI suggest-metadata + semantic-search
│   └── health.routes.ts   # GET /health
├── services/
│   ├── auth.service.ts    # Auth business logic
│   ├── books.service.ts   # Books business logic
│   └── ai.service.ts      # AI mock provider logic
└── schemas/
    ├── auth.schema.ts     # Zod schemas for auth
    ├── book.schema.ts     # Zod schemas for books
    └── ai.schema.ts       # Zod schemas for AI
prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Seed data
└── migrations/            # Auto-generated migrations
deploy/
├── scripts/
│   ├── install.sh         # First-time EC2 setup
│   └── deploy.sh          # Deployment script
└── systemd/
    └── library-api.service
.github/workflows/
├── ci.yml                 # CI pipeline (Node 20.x + 22.x)
└── deploy.yml             # Deploy to EC2 via SSH
```

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+ (or 22+)
- npm

### Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd mini-library-back

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# 4. Generate Prisma client + run migrations + seed
npx prisma generate
npx prisma migrate dev
# Seed runs automatically with migrate dev

# 5. Start the development server (with hot reload via tsx)
npm run start:dev
```

The API will be available at `http://localhost:3000`.
Swagger docs at `http://localhost:3000/api/docs`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `API_VERSION` | `1.0.0` | Shown in health check + Swagger |
| `DATABASE_URL` | `file:./data/library.db` | SQLite database path |
| `CORS_ORIGINS` | `http://localhost:3001,...` | Comma-separated allowed origins |
| `DEV_AUTH_ENABLED` | `false` | Enable dev auth endpoint |
| `JWT_SECRET` | - | Secret for dev JWT signing |
| `OIDC_ISSUER_URL` | - | OIDC provider issuer URL |
| `OIDC_AUDIENCE` | - | OIDC audience claim |
| `AI_PROVIDER` | `mock` | AI provider (`mock` or `openai`) |
| `OPENAI_API_KEY` | - | OpenAI API key (if using real AI) |

## Auth Quickstart (Dev Token)

The easiest way to authenticate for development:

### 1. Get a Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{
    "sub": "admin-001",
    "email": "admin@library.local",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

### 2. Use the Token

```bash
# In curl
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/books

# In Swagger UI
# 1. Open http://localhost:3000/api/docs
# 2. Click "Authorize" button
# 3. Enter: Bearer <token>
# 4. Click "Authorize"
# Now all endpoints will use your token
```

### Available Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full access (CRUD + delete + checkout/checkin) |
| `LIBRARIAN` | Book management (CRUD except delete + checkout/checkin) |
| `MEMBER` | Read-only (list/view books, view profile) |

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/dev-login` | No | Get dev JWT (dev only) |
| `GET` | `/me` | Yes | Current user profile |

### Books
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| `GET` | `/books` | Yes | Any | List books (paginated) |
| `GET` | `/books/:id` | Yes | Any | Get book by ID |
| `POST` | `/books` | Yes | ADMIN, LIBRARIAN | Create a book |
| `PUT` | `/books/:id` | Yes | ADMIN, LIBRARIAN | Update a book |
| `DELETE` | `/books/:id` | Yes | ADMIN | Delete a book |
| `POST` | `/books/:id/checkout` | Yes | ADMIN, LIBRARIAN | Check out a book |
| `POST` | `/books/:id/checkin` | Yes | ADMIN, LIBRARIAN | Check in a book |

### AI
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/ai/suggest-metadata` | Yes | AI metadata suggestions |
| `POST` | `/ai/semantic-search` | Yes | AI-powered book search |

## Swagger/OpenAPI Documentation

Professional OpenAPI 3.0 documentation is served at `/api/docs` and includes:

- Detailed endpoint descriptions with request/response examples
- Full component schemas with realistic sample data
- Error format documentation (consistent `{ error: { code, message, details } }`)
- Bearer auth support (click Authorize, enter `Bearer <token>`)
- Pagination contract for list endpoints
- Tagged by module: Auth, Books, AI, Health
- Raw JSON spec available at `/api/docs/json`

## Error Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Book with id '...' not found",
    "details": {},
    "requestId": "uuid"
  }
}
```

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`

## Scripts

```bash
npm run start:dev       # Development with hot reload (tsx watch)
npm run build           # Production build (tsc)
npm start               # Start production build
npm test                # Run unit tests
npm run test:cov        # Tests with coverage
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations (dev)
npm run prisma:seed     # Seed database
```

## Deployment on EC2 (Ubuntu, Free-Tier)

### Architecture

```
[S3 + CloudFront] -> SPA (frontend)
         | (API calls)
[EC2 t2.micro] -> Node.js + Express + SQLite
  └── /opt/library-api/
      ├── dist/          # Compiled JS
      ├── data/          # SQLite database
      ├── .env           # Configuration
      └── prisma/        # Migrations
```

### First-Time Setup

```bash
# On the EC2 instance (as root/sudo)
scp -r deploy/ ubuntu@<ec2-ip>:/tmp/deploy

# SSH into the instance
ssh ubuntu@<ec2-ip>

# Run install script
sudo bash /tmp/deploy/scripts/install.sh

# Edit the configuration
sudo nano /opt/library-api/.env
```

### Manual Deployment

```bash
# On your local machine: build and package
npm run build
tar -czf library-api.tar.gz dist/ prisma/ package.json package-lock.json deploy/

# Copy to EC2
scp library-api.tar.gz ubuntu@<ec2-ip>:/tmp/

# Deploy on EC2
ssh ubuntu@<ec2-ip> "sudo bash /opt/library-api/deploy/scripts/deploy.sh /tmp/library-api.tar.gz"
```

### CI/CD (GitHub Actions)

Automated deployment runs on push to `main`. Configure these GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | SSH user (e.g., `ubuntu`) |
| `EC2_SSH_KEY` | Private SSH key for EC2 |
| `APP_DIR` | App directory (default: `/opt/library-api`) |

### systemd Service

```bash
sudo systemctl start library-api    # Start
sudo systemctl stop library-api     # Stop
sudo systemctl restart library-api  # Restart
sudo systemctl status library-api   # Status
sudo journalctl -u library-api -f   # Live logs
```

## Optional: HTTPS with Let's Encrypt

> **Note**: HTTPS requires a **domain name** pointing to your EC2 public IP. Domain registration may cost ~$10-15/year. The TLS certificate itself is **free** via Let's Encrypt.

### If You Have a Domain

1. Point your domain (e.g., `api.yourlibrary.com`) to the EC2 public IP via DNS A record.

2. Install Nginx + Certbot:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

3. Create Nginx config `/etc/nginx/sites-available/library-api`:
```nginx
server {
    listen 80;
    server_name api.yourlibrary.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable and get certificate:
```bash
sudo ln -s /etc/nginx/sites-available/library-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourlibrary.com
```

Certbot auto-renews via systemd timer. No code changes needed.

### If You Don't Have a Domain

Let's Encrypt requires a publicly-reachable domain name for certificate validation. Without a domain:

- The API runs over **HTTP** (port 3000)
- This is acceptable for development and internal use
- The application is designed so HTTPS can be added later as an Nginx proxy without any code changes
- For production with sensitive data, obtain a domain and follow the steps above

## License

ISC
