Backend – README

This is the backend for the cowork booking system, built with Node.js and Express. It handles authentication, user management, room management, bookings, and notifications. The API is secured using JWT and supports role-based access for users and administrators.

The backend uses MongoDB Atlas as its database and Redis for caching frequently requested data such as rooms and bookings. It also integrates Socket.IO to send real-time notifications to connected users when relevant changes occur, such as booking updates or room modifications.

The application is deployed on Render and exposes a REST API consumed by the frontend. To run locally, install dependencies, configure environment variables for MongoDB, Redis, and JWT, and start the server. Logging and error handling are included to monitor system behavior and ensure stability.

This project fulfills the course requirements including authentication, role-based access, CRUD operations, real-time notifications, caching with Redis, and logging/error handling.
