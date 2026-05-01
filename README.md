# Backend Ledger

<p align="center">
  <a href="https://backend-ledger-main-cyvs.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit-brightgreen?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Deploy with Vercel">
  </a>
</p>

> A production-ready financial ledger & transaction management system with JWT authentication, account management, and multi-provider email notifications.

## Live Demo

**[https://backend-ledger-main-cyvs.vercel.app](https://backend-ledger-main-cyvs.vercel.app)**

## Testing Credentials

- Email- test-admin@ledger.com
- Password- password123

Note- Please don't delete the Account. Use it for transaction testing only. 

## Features

- 🔐 **JWT Authentication** - Secure user registration & login with JSON Web Tokens
- 💳 **Account Management** - Create, view balances, and manage multiple accounts
- 💸 **Transaction System** - Send funds between accounts with atomic transactions
- 👥 **Role-Based Access** - User and Admin roles with proper permissions
- 📧 **Email Notifications** - Multi-provider email support for account & transaction alerts
- 📚 **API Documentation** - Interactive Swagger/OpenAPI docs
- 🛡️ **Security** - Rate limiting, CORS, and input validation

## Email Providers Supported

| Provider | Status |
|----------|--------|
| Nodemailer (SMTP) | ✅ Tested |
| Resend | ✅ Tested |
| Brevo | 🔄 Under Testing |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/anomalyco/backend-ledger.git
cd backend-ledger

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

Create `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/backend-ledger
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3001

# Email (Brevo/SMTP)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email
BREVO_SMTP_PASS=your-password
```

### Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- API Docs: http://localhost:3000/api-docs

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-9.x-47A248?style=flat&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind CSS-3.4-06B6D4?style=flat&logo=tailwind-css" alt="Tailwind">
</p>

## API Endpoints

### Auth
```
POST /api/auth/register   - Create new account
POST /api/auth/login      - Login
POST /api/auth/logout     - Logout
```

### Accounts
```
POST   /api/accounts              - Create account
GET    /api/accounts              - List accounts
GET    /api/accounts/balance/:id  - Get balance
```

### Transactions
```
POST   /api/transactions           - Send funds
GET    /api/transactions          - Transaction history
```

### Admin
```
GET /api/admin/users        - All users
GET /api/admin/transactions - All transactions
```

## Project Structure

```
backend-ledger/
├── backend/              # Express.js API
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── models/      # MongoDB schemas
│       ├── routes/      # API routes
│       ├── services/    # Email & business logic
│       └── middleware/ # Auth & validation
│
└── frontend/           # Next.js 14 App
    └── src/
        ├── app/         # Pages & routing
        ├── components/  # React components
        └── store/       # Zustand state
```

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/anomalyco/backend-ledger)

## License

[ISC](./LICENSE) - Free to use

---

<p align="center">Built with ❤️ using Node.js, Express, MongoDB & Next.js</p>
