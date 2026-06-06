# Store Rating Platform

Full-stack implementation of the coding challenge using:

- React + Vite frontend
- NestJS backend
- MySQL database through TypeORM
- JWT authentication with role-based access for Admin, Normal User, and Store Owner

## Features

- Single login system for all roles
- Normal user signup
- Admin dashboard totals for users, stores, and ratings
- Admin user/store creation
- Admin user and store listings with filters and sortable columns
- Normal user store search, rating submission, and rating updates
- Store owner dashboard with average rating and users who submitted ratings
- Password update for logged-in normal users and store owners
- Validation for name, email, address, password, and rating range

## Setup

1. Start MySQL with Docker:

   ```bash
   docker compose up -d
   ```

   Or create a MySQL database manually:

   ```sql
   CREATE DATABASE store_rating_platform;
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Update database credentials and `JWT_SECRET` in `backend/.env`.

4. Create the first admin:

   ```bash
   npm run seed -w backend
   ```

5. Start both apps:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`

Backend API: `http://localhost:3001/api`

## Default Seed Admin

- Email: `admin@example.com`
- Password: `Admin@123`

Change these in `backend/.env` before running the seed command if needed.

## Important API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/admin/dashboard`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/me/password`
- `GET /api/stores`
- `POST /api/stores`
- `GET /api/stores/owner/dashboard`
- `PUT /api/stores/:storeId/ratings/me`
