
# SecureNotes — Full-Stack Personal Notes App

A secure, responsive full-stack personal notes management application built with **React, Node.js, Express, PostgreSQL and Prisma ORM v6**.

## Project Overview

SecureNotes allows registered users to create, organize, search, update and delete private notes. The application uses bcrypt password hashing, JWT authentication and resource-level authorization to ensure that every user can access only their own notes.

This project was developed as part of the **Week 7 Weekend Project — Authentication, Authorization & Security**.

## Learning Objectives

- Implement secure password hashing and salting with bcryptjs.
- Generate and verify JWT authentication tokens.
- Build protected REST API endpoints.
- Enforce user-specific resource authorization.
- Design PostgreSQL relationships using Prisma ORM v6.
- Validate incoming requests with Zod.
- Apply security best practices using Helmet, rate limiting and CORS.
- Manage React authentication state using Context API.
- Connect a React frontend to an Express backend.
- Deploy and test a secured full-stack application.

## Technologies Used

| Frontend | Backend | Database & Security |
|---|---|---|
| React | Node.js | PostgreSQL |
| Vite | Express | Prisma ORM v6 |
| CSS3 | Axios | bcryptjs |
| Context API | REST API | JWT, Zod |
| JavaScript | Middleware | Helmet, CORS, Rate Limiting |

## Key Features

### User Authentication
- User registration with email, name and password.
- Secure password hashing with randomly generated salts.
- JWT-based login and protected routes.
- Token expiry after 24 hours.
- Login validation and logout functionality.

### Personal Notes Management
- Create, view, edit and delete private notes.
- Categorize notes as Work, Personal, Ideas, School or General.
- Add multiple tags.
- Search notes by title or content.
- Filter by category or tag.
- Pin important notes.
- Restrict access to the authenticated note owner.

### Security Features
- Passwords never stored in plain text.
- Protected routes using JWT middleware.
- Ownership checks on note resources.
- Restricted cross-origin access.
- Rate limiting on authentication endpoints.
- Server-side request validation.
- Security headers using Helmet.
- Environment variables for sensitive configuration.

## Project Structure

```text
week-7-notes-app/
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── index.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
└── README.md
```

## Installation and Setup

### Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Create `server/.env` containing your PostgreSQL connection string, JWT secret and frontend origin.

### Frontend

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5002/api
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:5002`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Authenticated profile |
| GET | `/api/notes` | Retrieve private notes |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Retrieve specific note |
| PUT | `/api/notes/:id` | Update owned note |
| DELETE | `/api/notes/:id` | Delete owned note |

### Search and Filtering

```text
GET /api/notes?search=javascript
GET /api/notes?category=Work
GET /api/notes?tag=security
```

## Deployment

**Live Frontend:** [https://week-7-notes-app.vercel.app]

**Backend API:** [https://week-7-notes-app-production.up.railway.app]

**Live Pages:** [https://dominic-kores.github.io/week-7-notes-app]








## Author

**Dominic Kores Kisioya**

Full-Stack Software & AI Engineer


