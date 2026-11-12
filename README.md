# Tricity Dashboard

Initial Angular + Spring Boot + PostgreSQL foundation for Tricity.

## Run locally

1. Start Docker Desktop, then start PostgreSQL: `docker compose up -d postgres` (Tricity uses host port `55432`)
2. Start the API from `backend`: `mvn spring-boot:run`
3. Start the UI from `frontend`: `npm install` then `npm start`

Demo back-office access:

- Email: `admin@admin.com`
- Password: `mdp admin`

The demo credentials are seeded by the API for local development only.

If PostgreSQL reports `password authentication failed for user "tricity"` because an older local volume already exists, reset the development database with:

```powershell
docker compose down -v
docker compose up -d postgres
```

This removes only the local Docker development database volume.
