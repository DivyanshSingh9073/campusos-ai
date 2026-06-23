# Backend (Express + PostgreSQL + JWT)

## Setup
1. Install dependencies:
```bash
npm install
```
2. Create env:
```bash
copy .env.example .env
```
3. Make sure PostgreSQL is running and `DATABASE_URL` is correct.
4. Run dev:
```bash
npm run dev
```

## Test Login
- `POST http://localhost:5000/api/auth/login`
- Body: `{ "email": "...", "password": "..." }`

## Notes
- This repo includes DB auto-migration for the `users` table.
- Seed/register flow is not included yet (you’ll add it next).
