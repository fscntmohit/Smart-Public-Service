# Smart Public Service CRM (PS-CRM) — Frontend

React + Vite frontend for PS-CRM, a role-based public grievance platform for citizens, officers, and admins.

## Core Features

- Role-based dashboards (`citizen`, `officer`, `admin`)
- Public complaint tracking (no authentication) using complaint ID
- Complaint submission with image upload/capture
- Officer workflow with strict forward-only status lifecycle:
	- `Pending → In Progress → Resolved`
- Admin analytics (charts, trends, category/area distribution)
- Help center dropdown in navbar with routes:
	- `/help/video`
	- `/help/faq`
	- `/help/contact`
- Multilingual support (English/Hindi)
- Dark/Light theme toggle

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS 4
- Clerk (authentication)
- Axios
- Recharts
- Leaflet / React Leaflet
- i18next / react-i18next

## Project Structure

- `src/pages` — route-level pages
- `src/components` — reusable UI + layout components
- `src/services` — API layer
- `src/i18n.js` — translation setup
- `src/context/ThemeContext.jsx` — dark/light theme provider

## Prerequisites

- Node.js 18+
- Backend API running (PS-CRM backend)

## Environment Variables

Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Notes:
- `VITE_API_URL` must point to backend `/api` base.
- If backend runs on a different port, update this value.

## Install & Run

```bash
npm install
npm run dev
```

Default dev URL:
- `http://localhost:5173`

## Available Scripts

- `npm run dev` — start dev server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint

## Backend Integration

This frontend expects these backend routes:

- `POST /complaints`
- `GET /complaints/my`
- `GET /complaints/officer`
- `PATCH /complaints/:id/status`
- `GET /complaints/track/:complaintId` (public)
- `GET /analytics/*`

## Status Workflow Rules (Enforced)

The UI follows backend-enforced transition rules:

- Allowed: `Pending → In Progress`
- Allowed: `In Progress → Resolved`
- Blocked: any backward transition
- Locked: resolved complaints cannot be modified

## Build Notes

- Keep Clerk keys and API URL in environment variables.
- Ensure backend CORS includes frontend origin.
