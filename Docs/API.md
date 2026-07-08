# API Endpoints

## Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/profile

---

## Notes

POST /api/notes/upload

GET /api/notes

GET /api/notes/:id

DELETE /api/notes/:id

---

## Tasks

POST /api/tasks

GET /api/tasks

PUT /api/tasks/:id

DELETE /api/tasks/:id

---

## Notifications (Phase 13)

GET /api/notifications?limit=50

GET /api/notifications/unread-count

POST /api/notifications

PATCH /api/notifications/:id/read

PATCH /api/notifications/read-all

DELETE /api/notifications/:id
