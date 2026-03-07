# Cowork Booking Backend

Backend API for a coworking booking platform.

## Tech
- Node.js + Express
- MongoDB (Mongoose)
- JWT + bcrypt
- Redis (cache)
- Socket.io (realtime notifications)
- Pino (logging)
- Deployment: Render

## Run locally

1) Install deps
```bash
npm install
```

2) Create `.env` from `.env.example`

3) Start dev server
```bash
npm run dev
```

Health check:
- `GET /health`

## API (WIP)
Auth:
- `POST /register`
- `POST /login`

Rooms (Admin):
- `POST /rooms`
- `GET /rooms`
- `PUT /rooms/:id`
- `DELETE /rooms/:id`

Bookings:
- `POST /bookings`
- `GET /bookings`
- `PUT /bookings/:id`
- `DELETE /bookings/:id`

Socket events (WIP):
- `booking:created`
- `booking:updated`
- `booking:deleted`
