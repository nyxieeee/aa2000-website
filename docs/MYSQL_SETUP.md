# Connecting the site to MySQL

Products are stored in MySQL when the API is reachable. The app tries `/api/products` on load; if it succeeds, it uses the database. Otherwise it falls back to localStorage.

## 1. Create the database and table

Create a database (e.g. `aa2000`) and run the schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aa2000;"
mysql -u root -p aa2000 < scripts/schema.sql
```

Or run the contents of `scripts/schema.sql` in your MySQL client (phpMyAdmin, MySQL Workbench, etc.).

## 2. Set environment variables

The API uses these variables to connect to MySQL.

**Option A – Connection URL (e.g. PlanetScale, Railway):**

- `DATABASE_URL` = `mysql://USER:PASSWORD@HOST:3306/DATABASE`

**Option B – Separate values:**

- `MYSQL_HOST` (default: localhost)
- `MYSQL_USER` (default: root)
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE` (default: aa2000)

### Local development

Create a `.env` in the project root (do not commit it):

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=aa2000
```

Run the API locally with:

```bash
npx vercel dev
```

This serves both the Vite app and the `/api` routes. The app will call `/api/products` on the same host.

### Vercel (production)

In the Vercel project: **Settings → Environment Variables**, add the same variables (`DATABASE_URL` or `MYSQL_*`). Redeploy so the serverless functions use them.

**Important:** Use a **host that allows outbound connections** (e.g. PlanetScale, Railway, Aiven). Many free “localhost” MySQL services are not reachable from Vercel.

## 3. Optional: point the frontend to another API URL

If the API runs on a different domain, set:

```env
VITE_API_URL=https://your-api-domain.com
```

Then rebuild. If unset, the app uses the same origin (e.g. `https://your-site.vercel.app/api`).

## Summary

1. Run `scripts/schema.sql` in your MySQL database.
2. Set `DATABASE_URL` or `MYSQL_*` in Vercel (and in `.env` for `vercel dev`).
3. Deploy. The site will use MySQL when `/api/products` returns successfully.
