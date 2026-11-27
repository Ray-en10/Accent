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

## Deploy (Vercel + Render + Supabase)

The Angular frontend is configured for Vercel, the Spring Boot API for Render, and Supabase provides PostgreSQL. Deploy the API first so the frontend proxy can reach it.

This project is currently suitable only as a public demo with fake/test data: the backend does not enforce authentication on its admin APIs. Do not use real customer accounts or personal data until backend authorization is implemented.

1. Create a Supabase project. In **Connect**, select **Session pooler** and copy its connection details. Configure these environment variables for the Render service:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<pooler-host>:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: the username from Supabase's session-pooler connection string
   - `SPRING_DATASOURCE_PASSWORD`: the database password
2. Push this repository to GitHub and create a Render Blueprint from it using `render.yaml`. The API service is named `tricity-api`; set the three Supabase values when Render prompts for them.
3. In Vercel, import the same repository and set the project **Root Directory** to `frontend`. The included `vercel.json` builds Angular and routes `/api/*` through Render. It currently targets `https://tricity-api.onrender.com`; update that destination in `frontend/vercel.json` if Render assigns a different service URL.
4. After Vercel gives you the site URL, set `APP_PUBLIC_URL` on Render to that URL (without a trailing slash). This is used in password and account emails.
5. To enable account creation and password-reset emails, configure Render's SMTP settings: `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`, and `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`. Without a real SMTP provider, these email flows will not work.

Keep Supabase database credentials in Render environment variables; never add them to frontend code or commit them to the repository.

After login, clients are sent to `/client`, where they can see their daily and STEG cycle consumption, hourly real-time usage, circuit distribution, objectives, and notifications. Back-office users can open **Par gouvernorat** to drill from a governorate into its individual sites.

Visitors can choose Solo/Duo packs and submit a request from the landing page. The form validates the governorate/city relationship and sends the request to **Administration → Demandes de compte**, where it can be confirmed, rejected, or returned to pending.

If PostgreSQL reports `password authentication failed for user "tricity"` because an older local volume already exists, reset the development database with:

```powershell
docker compose down -v
docker compose up -d postgres
```

This removes only the local Docker development database volume.
