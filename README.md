# 🔒 FAZE — Paid Media Locker

A backend system for a paid media locker application. Users upload images, set an unlock price, and other users spend coins from a wallet to unlock the original image (they only see a blurred/low-res preview until they pay).

## Tech Stack

- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Containerization**: Docker + docker-compose

## Project Structure

```
src/
├── config/         # Environment & app configuration
├── controllers/    # Route handlers (thin HTTP layer)
├── db/             # Prisma client singleton
├── middleware/      # Auth, validation, error handling, logging
├── routes/         # Express routers
├── services/       # Business logic
├── utils/          # Helpers (AppError, asyncHandler)
└── validators/     # Zod schemas
prisma/
└── schema.prisma   # Database schema
```

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

This starts PostgreSQL, S3 mock, and the backend. Migrations run automatically.

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start PostgreSQL (Docker or local install)
docker-compose up postgres -d

# 4. Run migrations
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate

# 6. Start dev server
npm run dev
```

## API Endpoints (Day 1)

| Method | Endpoint             | Auth | Description               |
|--------|----------------------|------|---------------------------|
| GET    | `/api/health`        | ❌   | Health check + DB status  |
| POST   | `/api/auth/register` | ❌   | Create account            |
| POST   | `/api/auth/login`    | ❌   | Login, get JWT            |
| GET    | `/api/wallet`        | ✅   | Balance + 20 transactions |

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "mypassword123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "mypassword123"}'
```

### Get Wallet
```bash
curl http://localhost:4000/api/wallet \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT auth with configurable expiration
- Rate limiting on auth endpoints (10 req / 15 min per IP)
- All inputs validated with Zod before DB access
- `passwordHash` never exposed in any API response
- Parameterized queries via Prisma (no raw SQL)
- Audit logging for auth events

### Security Considerations (Media Protection)

To protect paid content and ensure robust security, the following architectural decisions have been implemented:

- **Access control**: All media access requests are routed through the `/api/media/proxy` endpoint, which sits entirely behind JWT authentication middleware. Unauthenticated requests are strictly rejected.
- **Media storage strategy**: Original high-resolution files and compressed previews are stored in a private S3 bucket. Public access is disabled at the bucket level.
- **Preventing direct access to original files**: S3 Presigned URLs are never exposed directly to the client. Instead, the backend Node.js server proxies the image stream, acting as a secure gateway.
- **Ownership validation**: Before the proxy streams any file prefixed with `original-`, it performs a database lookup via Prisma to verify that the requesting user either owns the media or has a valid `Purchase` record.
- **Secure delivery of unlocked content**: The React Native frontend is configured to securely pass the user's Bearer token in the headers of all `<Image>` components, ensuring secure delivery of the proxied streams.

## Environment Variables

| Variable       | Description                  | Default                      |
|----------------|------------------------------|------------------------------|
| `DATABASE_URL` | PostgreSQL connection string | Required                     |
| `JWT_SECRET`   | Secret for signing JWTs      | Required                     |
| `JWT_EXPIRES_IN`| Token expiration            | `7d`                         |
| `PORT`         | Server port                  | `4000`                       |

## License

ISC
