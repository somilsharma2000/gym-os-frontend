# GYM OS — Gym Management Platform

Multi-tenant gym management system for Oxigen Fitness — C-Scheme, Jaipur (Demo Mode).

## Features

- **Command Center** — Live KPI dashboard with real entity data
- **Lead CRM** — Lead capture, search, filters, duplicate detection, consent tracking
- **Trial Engine** — Issue trial passes with server-generated QR tokens
- **QR Check-In** — Validate QR tokens and record attendance
- **Members** — Member management with membership and risk status

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

## Backend

The app calls Base44 backend functions deployed on the GYMOS Superagent app:

```
API Base: https://base44.app/api/apps/6a8949954092729194579577/functions
```

### Available Functions

| Function | Purpose |
|----------|---------|
| `getDashboardData` | Dashboard KPIs + recent activity |
| `getLeads` | List/filter/search leads |
| `createLeadWithConsent` | Create lead with consent + duplicate detection |
| `getTrialPasses` | List trial passes |
| `createTrialPass` | Issue trial pass with QR token |
| `validateQR` | Validate QR token |
| `checkIn` | Record attendance (prevents duplicates) |
| `getMembers` | List members with membership info |
| `getRecentCheckIns` | Recent attendance records |
| `getClassSchedule` | Class schedule with capacity |
| `createClassBooking` | Book a class |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo Mode

All data is demo/sample data for Oxigen Fitness — Concept Demo.
- Gym ID: `gym_oxigen_demo`
- Branch: C-Scheme, Jaipur
- No real payments, notifications, or production data
