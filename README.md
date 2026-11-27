# Tricity Dashboard

Initial Angular + Spring Boot + PostgreSQL foundation for Tricity.

## Run locally

1. Start Docker Desktop, then start PostgreSQL and MailDev: `docker compose up -d postgres maildev` (Tricity uses host port `55432`; MailDev is available at http://localhost:1080)
2. Start the API from `backend`: `mvn spring-boot:run`
3. Start the UI from `frontend`: `npm install` then `npm start`

Demo accounts:

- Admin: `admin@admin.com` / `mdp admin`
- Client: `client-test@gmail.com` / `12345678`
- Installer: `Installer-test@gmail.com` / `12345678`

These accounts are seeded by the API. Use the role buttons on the login page to fill in their credentials.

Back-office account creation generates a temporary password, hashes it in the API, and sends the login details through MailDev. Open the MailDev inbox at http://localhost:1080 after creating a client or installer from **Administration**.

After login, clients are sent to `/client`, where they can see their daily and STEG cycle consumption, hourly real-time usage, circuit distribution, objectives, and notifications. Back-office users can open **Par gouvernorat** to drill from a governorate into its individual sites.

Visitors can choose Solo/Duo packs and submit a request from the landing page. The form validates the governorate/city relationship and sends the request to **Administration → Demandes de compte**, where it can be confirmed, rejected, or returned to pending.

If PostgreSQL reports `password authentication failed for user "tricity"` because an older local volume already exists, reset the development database with:

```powershell
docker compose down -v
docker compose up -d postgres
```

This removes only the local Docker development database volume.
