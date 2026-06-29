# Database Schema

## users

| Column | Type |
|----------|------|
| id | INTEGER |
| name | VARCHAR |
| email | VARCHAR |
| password_hash | TEXT |

---

## notes

| Column | Type |
|----------|------|
| id | INTEGER |
| title | VARCHAR |
| subject | VARCHAR |
| file_url | TEXT |
| user_id | INTEGER |

---

## tasks

| Column | Type |
|----------|------|
| id | INTEGER |
| title | VARCHAR |
| due_date | DATE |
| completed | BOOLEAN |
| user_id | INTEGER |
