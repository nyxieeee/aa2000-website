# Local setup (XAMPP + MySQL)

Para gumana ang admin products sa MySQL sa iyong PC gamit ang XAMPP.

## 1. I-start ang MySQL sa XAMPP

1. Buksan **XAMPP Control Panel**.
2. I-click **Start** sa **MySQL** (kung naka-stop).
3. Siguraduhin na “Running” ang status ng MySQL.

## 2. Gawing database at table

**Option A – phpMyAdmin (madali)**

1. Sa browser, punta sa **http://localhost/phpmyadmin**.
2. I-click **New** (o “Databases”) at gumawa ng bagong database:
   - Database name: **`aa2000`**
   - Collation: `utf8mb4_general_ci` (o iwanan default).
3. Piliin ang database **aa2000** sa left sidebar.
4. I-click tab **SQL**, i-paste ang buong laman ng **`scripts/schema.sql`**, then **Go**.

**Option B – Command line**

Kung naka-set na ang `mysql` sa PATH (hal. nasa XAMPP `mysql\bin`):

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aa2000;"

# Create products table
mysql -u root -p aa2000 < scripts/schema.sql
```

Kapag walang password ang `root`, puwede:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS aa2000;"
mysql -u root aa2000 < scripts/schema.sql
```

## 3. Gumawa ng default admin user (para sa login)

Pagkatapos ma-create ang tables (step 2), i-run sa **project root**:

```bash
npm run seed-admin
```

Magiging available ang default admin: **username = `admin`**, **password = `admin`**. (Naka-save ang hash sa table `admin_users` sa database.)

## 4. I-configure ang `.env`

Sa **root ng project** (kung saan ang `package.json`):

1. Kung wala pa, kopyahin: **`.env.example`** → **`.env`**.
2. I-edit ang `.env` para tumugma sa XAMPP MySQL:

```env
# MySQL – XAMPP default (walang password)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aa2000

# API server port (Vite proxy dito nagfo-forward ng /api)
PORT=3001
```

Kung may password ang MySQL user mo, ilagay sa `MYSQL_PASSWORD=`.

## 5. I-run ang app (dalawang terminal)

**Terminal 1 – API server (Node + MySQL)**

```bash
npm run server
```

Dapat may lumabas na: `API server running at http://localhost:3001`

**Terminal 2 – Frontend (Vite)**

```bash
npm run dev
```

Buksan ang URL na ibibigay ng Vite (hal. **http://localhost:5173**).

## 6. I-test ang connection at admin login

1. **Para makita ang login:** pumunta sa **http://localhost:5173/admin** (hindi ang homepage). Dapat lumabas ang **Admin Login** na may Username at Password.
2. Mag-login gamit ang credentials sa database: **username = `admin`**, **password = `admin`** (kung nag-run ka ng `npm run seed-admin`).
3. Pagkatapos mag-login, makikita mo ang **Admin → Products**. Mag-**Add product** at i-save.
4. Kung lumabas ang product sa list at sa public **Products** page, konektado na ang app sa MySQL.

Kung “Cannot reach server” ang error sa login, siguraduhing naka-run ang **Terminal 1** (`npm run server`).

## Flow ng data

- **Admin login:** credentials naka-save sa table **`admin_users`** (username + password hash). Ang `npm run seed-admin` ang gumagawa ng default user.
- **Frontend** (React) → tumatawag sa **`/api/auth/login`** at **`/api/products`**.
- **Vite dev server** nag-**proxy** ng `/api` papuntang **http://localhost:3001**.
- **Node server** (`server/index.js`) kumokonekta sa **MySQL** (XAMPP) at nagbabasa/nagsusulat sa **`products`** at **`admin_users`**.

Kung naka-stop ang `npm run server`, ang site ay gagamit ng **localStorage** para sa products (fallback). Kapag naka-run ang server at MySQL, ang **MySQL** ang source ng products at ng admin login.
