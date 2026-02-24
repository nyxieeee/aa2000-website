# Setup gamit XAMPP (MySQL)

Para magamit ang XAMPP MySQL sa project na ito, sundin ang steps below.

## 1. I-start ang MySQL sa XAMPP

1. Buksan ang **XAMPP Control Panel**.
2. I-click **Start** sa **Apache** (optional, kung gagamit ka rin ng phpMyAdmin).
3. I-click **Start** sa **MySQL**.
4. Dapat green na ang MySQL.

## 2. Gawin ang database at table

**Option A – phpMyAdmin (madali)**

1. Sa browser, punta sa **http://localhost/phpmyadmin**
2. I-click **New** (left) para gumawa ng bagong database.
3. Database name: **aa2000** → Create.
4. Piliin ang database **aa2000** sa left.
5. I-click tab **SQL**, i-paste ang buong laman ng **`scripts/schema.sql`** sa project, tapos **Go**.

**Option B – Command line**

1. Sa XAMPP, ang MySQL command ay karaniwang nasa  
   `C:\xampp\mysql\bin\mysql.exe`
2. Open **Command Prompt** o **PowerShell**:

```powershell
cd c:\Users\portu\aa2000-website

# Gumawa ng database
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS aa2000;"

# I-run ang schema (kung walang password ang root)
C:\xampp\mysql\bin\mysql.exe -u root aa2000 < scripts/schema.sql

# Kung may password ang root:
# C:\xampp\mysql\bin\mysql.exe -u root -p aa2000 < scripts/schema.sql
```

## 3. Ilagay ang .env sa project

Sa **root ng project** (same folder as `package.json`), gumawa ng file na **`.env`**:

**Kung walang password ang MySQL user `root` (default XAMPP):**

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aa2000
```

**Kung may password ang `root`:**

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=aa2000
```

I-save. Huwag i-commit ang `.env` sa git (naka-ignore na dapat).

## 4. I-run ang site at API

Dapat naka-run ang **MySQL** lang sa XAMPP (Apache optional). Sa project folder:

```powershell
cd c:\Users\portu\aa2000-website
npm run build
npx vercel dev
```

O kung dev lang (Vite + API):

```powershell
npx vercel dev
```

Pag open ng **http://localhost:3000** (o kung ano ang port na sinabi ni Vercel dev):

- Pumunta sa **http://localhost:3000/admin** → login (default password: **admin**).
- Sa Admin → Products dapat makita mo “Connected to MySQL (API)” at makakapag-add ka ng products mula sa XAMPP MySQL.

## 5. Kung may error

- **“Database error” / “Failed to fetch products”**  
  - Check: MySQL sa XAMPP naka-Start.  
  - Check: tama ang `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` sa `.env`.  
  - Sa phpMyAdmin, try mag-login with same user/password.

- **Port 3306 in use**  
  - May ibang app na gumagamit ng 3306; either i-stop o gamitin ang MySQL ng XAMPP lang.

- **Table doesn’t exist**  
  - Ulitin ang step 2 at i-run ulit ang `scripts/schema.sql` sa database **aa2000**.

## Summary

1. XAMPP → Start **MySQL**.
2. Gumawa ng database **aa2000** at i-run **`scripts/schema.sql`** (phpMyAdmin o CLI).
3. Gumawa ng **`.env`** sa project root na may `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.
4. Sa project: **`npx vercel dev`** → buksan site at `/admin` para mag-add ng products mula sa XAMPP.
