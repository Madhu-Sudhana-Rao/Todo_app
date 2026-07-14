# Prioritize - Premium Task Workspace

Prioritize is a production-ready, beautiful, full-stack Task Management workspace built using Python (**FastAPI**) and React (**Vite**). It features a modern, clean design inspired by Linear and ClickUp, implementing smooth transitions, advanced analytics dashboards, drag-and-drop Kanban boards, monthly calendars, keyboard shortcuts, and CSV import/export capability.

## Project Structure

```
todo-app/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── auth/            # JWT validation and password hashing
│   │   ├── core/            # Configuration and settings
│   │   ├── database/        # Database session and connection
│   │   ├── exceptions/      # Centralized HTTP error handlers
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── repositories/    # Database CRUD interfaces
│   │   ├── routers/         # API Routers (Auth, Todos, Dashboard)
│   │   ├── schemas/         # Pydantic validation models
│   │   ├── services/        # Business logic controllers
│   │   └── main.py          # FastAPI application entrypoint
│   ├── alembic/             # Alembic migration records
│   ├── requirements.txt     # Python libraries list
│   └── Procfile             # Web process starter config
├── frontend/                 # React JavaScript Frontend
│   ├── src/
│   │   ├── components/      # UI components (Sidebar, Navbar, Modals)
│   │   ├── layouts/         # Layout wrappers (Auth, Dashboard)
│   │   ├── pages/           # Pages (Dashboard, Todos, Profile, Login)
│   │   ├── redux/           # Redux Toolkit store and slices
│   │   ├── services/        # Axios API client setup
│   │   ├── index.css        # Tailwind and global styles
│   │   └── App.jsx          # Route mappings and providers
│   ├── vite.config.js       # Vite and Tailwind plugin config
│   └── package.json         # NPM libraries list
└── render.yaml               # Render Infrastructure Blueprints
```

---

## Core Features

- **Secure JWT Authentication**: Sign up, log in, sign out, password changing, and silent JWT token refresh rotation.
- **Productivity Dashboard**: Statistics on completed vs pending tasks, overdue calculations, and an SVG productivity chart highlighting past 7-day completion volumes.
- **Dynamic Task Manager**: Filter tasks by Pending, Completed, Categories, Favorites, Archived, or Trash. Sort tasks by due date, priority, or creation date.
- **Kanban Board**: Drag tasks between Low, Medium, and High priorities, or Completed sections, using `@hello-pangea/dnd`.
- **Calendar View**: High-fidelity monthly calendar layout showcasing tasks directly on their due dates.
- **Data Import / Export**: Download your workspace data as a CSV backup file, or upload tasks directly.
- **Keyboard Shortcuts**: Quickly jump to views, search, or add tasks with shortcuts (Inbox `/`, Add task `C`, Shortcuts helper `?`).
- **Dark & Light Mode**: Seamless dark and light themes persisted in local storage.

---

## Local Development Installation

### Prerequisites
- Python 3.12+
- Node.js 18+

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install required libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file to `.env` and set variables:
   ```bash
   cp .env.example .env
   ```
   *Note: If `DATABASE_URL` is omitted, the application automatically falls back to a local SQLite database (`todo.db`), creating tables on startup.*
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Access the backend docs at [http://localhost:8000/api/docs](http://localhost:8000/api/docs).

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open the application in your browser at [http://localhost:5173](http://localhost:5173).

---

## API Documentation Reference

All API calls are prefixed with `/api`.

### Authentication
- `POST /auth/register` - Create a new user account.
- `POST /auth/login` - Authenticate and obtain Access & Refresh tokens.
- `POST /auth/refresh` - Rotate tokens using a refresh token.
- `GET /auth/me` - Retrieve authenticated user profile metadata.
- `PUT /auth/me` - Update username, email, or avatar image link.
- `PUT /auth/password` - Change user password.

### Todos
- `GET /todos` - Fetch user tasks with pagination, filters, and sorting.
- `POST /todos` - Create a new task.
- `GET /todos/{id}` - Fetch single task details.
- `PUT /todos/{id}` - Update task details.
- `DELETE /todos/{id}` - Soft-delete (move to trash) or permanently delete.
- `PATCH /todos/{id}/complete` - Toggle completed state.
- `PATCH /todos/{id}/favorite` - Toggle favorited state.
- `PATCH /todos/{id}/archive` - Toggle archived state.
- `PATCH /todos/{id}/restore` - Restore soft-deleted task from trash.
- `GET /todos/export-csv` - Download active tasks database as a CSV backup.
- `POST /todos/import-csv` - Upload tasks from a CSV backup file.

### Dashboard
- `GET /dashboard` - Fetch total, pending, completed, overdue, and today count statistics along with activity streams and productivity chart data.

---

## Environment Variables

### Backend Configuration
- `DATABASE_URL`: Connection string of PostgreSQL or SQLite database.
- `SECRET_KEY`: Secret string used to sign JWT tokens.
- `ALGORITHM`: Hash algorithm used to encode JWT (default: `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT access token duration in minutes.

### Frontend Configuration
- `VITE_API_URL`: Root path of the FastAPI Backend instance.

---

## Deploying to Render

This project contains a `render.yaml` configuration file allowing quick blueprint deployments.

1. Create a free account on [Render](https://render.com).
2. Connect your Git provider (GitHub or GitLab) to Render.
3. Select **Blueprints** on the Render dashboard and link your repository.
4. Render will automatically parse the `render.yaml` blueprint and provision:
   - A **PostgreSQL database** instance.
   - A **FastAPI Web Service** running Python (connected to PostgreSQL).
   - A **Static React Site** compiling frontends.
5. Render will expose the Frontend site link. Click it, create a user, and start organizing your tasks!

---

## Future Improvements Roadmap
- Implement push notifications using Service Workers / Web Push API.
- Support recurring task scheduler routines (e.g. daily, weekly).
- Support collaborative tasks and user project sharing.
- Enable email summaries sent weekly to users highlighting productivity.
