import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3001;
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'aa2000',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function rowToProduct(row) {
  if (!row) return null;
  let specs = {};
  let inclusions = [];
  try {
    if (row.specs) specs = JSON.parse(row.specs);
  } catch {}
  try {
    if (row.inclusions) inclusions = JSON.parse(row.inclusions);
  } catch {}
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description ?? '',
    fullDescription: row.full_description ?? '',
    image: row.image ?? '',
    specs,
    inclusions: Array.isArray(inclusions) ? inclusions : [],
    installationPrice: Number(row.installation_price ?? 0),
    supplierId: row.supplier_id != null ? row.supplier_id : null,
    supplierName: row.supplier_name ?? null,
  };
}

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.id'
    );
    const products = rows.map(rowToProduct);
    res.json(products);
  } catch (err) {
    console.error('GET /api/products', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/products/unassigned', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, NULL AS supplier_name FROM products p WHERE p.supplier_id IS NULL ORDER BY p.id'
    );
    const products = rows.map(rowToProduct);
    res.json(products);
  } catch (err) {
    console.error('GET /api/products/unassigned', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [rows] = await pool.query(
      'SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?',
      [id]
    );
    const product = rowToProduct(rows[0]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('GET /api/products/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.post('/api/products', async (req, res) => {
  const body = req.body || {};
  const name = String(body.name ?? '').trim();
  const category = String(body.category ?? '').trim();
  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' });
  }
  const price = Number(body.price);
  const description = String(body.description ?? '');
  const fullDescription = String(body.fullDescription ?? body.full_description ?? '');
  const image = String(body.image ?? '');
  const installationPrice = Number(body.installationPrice ?? body.installation_price ?? 0);
  const specs = typeof body.specs === 'object' && body.specs !== null ? body.specs : {};
  const inclusions = Array.isArray(body.inclusions) ? body.inclusions : [];
  const supplierId = body.supplierId != null ? (Number(body.supplierId) || null) : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, category, price, description, full_description, image, specs, inclusions, installation_price, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        Number.isNaN(price) ? 0 : price,
        description,
        fullDescription,
        image,
        JSON.stringify(specs),
        JSON.stringify(inclusions),
        Number.isNaN(installationPrice) ? 0 : installationPrice,
        supplierId,
      ]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query(
      'SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?',
      [insertId]
    );
    const product = rowToProduct(rows[0]);
    res.status(201).json(product);
  } catch (err) {
    console.error('POST /api/products', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const body = req.body || {};

  const updates = [];
  const values = [];

  if (body.name !== undefined) {
    updates.push('name = ?');
    values.push(String(body.name));
  }
  if (body.category !== undefined) {
    updates.push('category = ?');
    values.push(String(body.category));
  }
  if (body.price !== undefined) {
    updates.push('price = ?');
    values.push(Number(body.price));
  }
  if (body.description !== undefined) {
    updates.push('description = ?');
    values.push(String(body.description));
  }
  if (body.fullDescription !== undefined) {
    updates.push('full_description = ?');
    values.push(String(body.fullDescription));
  }
  if (body.image !== undefined) {
    updates.push('image = ?');
    values.push(String(body.image));
  }
  if (body.installationPrice !== undefined) {
    updates.push('installation_price = ?');
    values.push(Number(body.installationPrice));
  }
  if (body.specs !== undefined) {
    updates.push('specs = ?');
    values.push(JSON.stringify(typeof body.specs === 'object' && body.specs !== null ? body.specs : {}));
  }
  if (body.inclusions !== undefined) {
    updates.push('inclusions = ?');
    values.push(JSON.stringify(Array.isArray(body.inclusions) ? body.inclusions : []));
  }
  if (body.supplierId !== undefined) {
    updates.push('supplier_id = ?');
    values.push(body.supplierId == null || body.supplierId === '' ? null : Number(body.supplierId));
  }

  const selectWithSupplier = 'SELECT p.*, s.name AS supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?';

  if (updates.length === 0) {
    const [rows] = await pool.query(selectWithSupplier, [id]);
    const product = rowToProduct(rows[0]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  }

  values.push(id);
  try {
    const [result] = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const [rows] = await pool.query(selectWithSupplier, [id]);
    const product = rowToProduct(rows[0]);
    res.json(product);
  } catch (err) {
    console.error('PUT /api/products/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/products/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// --- Orders (checkout submissions; admin can list)
app.post('/api/orders', async (req, res) => {
  const body = req.body || {};
  const fullName = String(body.fullName ?? body.full_name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const address = String(body.address ?? '').trim();
  const city = String(body.city ?? '').trim();
  const zipCode = String(body.zipCode ?? body.zip_code ?? '').trim();
  const subtotal = Number(body.subtotal);
  const discountAmount = Number(body.discountAmount ?? body.discount_amount ?? 0);
  const discountCode = String(body.discountCode ?? body.discount_code ?? '').trim();
  const total = Number(body.total);
  const items = Array.isArray(body.items) ? body.items : [];

  if (!fullName || !email || !phone || !address || !city || !zipCode) {
    return res.status(400).json({ error: 'Missing required customer fields' });
  }
  if (items.length === 0) {
    return res.status(400).json({ error: 'Order must have at least one item' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      `INSERT INTO orders (full_name, email, phone, address, city, zip_code, subtotal, discount_amount, discount_code, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        fullName,
        email,
        phone,
        address,
        city,
        zipCode,
        Number.isNaN(subtotal) ? 0 : subtotal,
        Number.isNaN(discountAmount) ? 0 : discountAmount,
        discountCode,
        Number.isNaN(total) ? 0 : total,
      ]
    );
    const orderId = orderResult.insertId;
    for (const item of items) {
      const productId = Number(item.id ?? item.productId ?? 0);
      const productName = String(item.name ?? '').trim() || 'Product';
      const price = Number(item.price ?? 0);
      const quantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, productId, productName, price, quantity]
      );
    }
    await connection.commit();
    const [rows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const row = rows[0];
    const order = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      zipCode: row.zip_code,
      subtotal: Number(row.subtotal),
      discountAmount: Number(row.discount_amount),
      discountCode: row.discount_code ?? '',
      total: Number(row.total),
      status: row.status,
      createdAt: row.created_at,
    };
    res.status(201).json(order);
  } catch (err) {
    await connection.rollback();
    console.error('POST /api/orders', err);
    res.status(500).json({ error: err.message || 'Database error' });
  } finally {
    connection.release();
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    const orders = rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      zipCode: row.zip_code,
      subtotal: Number(row.subtotal),
      discountAmount: Number(row.discount_amount),
      discountCode: row.discount_code ?? '',
      total: Number(row.total),
      status: row.status,
      createdAt: row.created_at,
    }));
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const row = orderRows[0];
    if (!row) return res.status(404).json({ error: 'Order not found' });
    const [itemRows] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ? ORDER BY id',
      [id]
    );
    const order = {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      city: row.city,
      zipCode: row.zip_code,
      subtotal: Number(row.subtotal),
      discountAmount: Number(row.discount_amount),
      discountCode: row.discount_code ?? '',
      total: Number(row.total),
      status: row.status,
      createdAt: row.created_at,
      items: itemRows.map((r) => ({
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        price: Number(r.price),
        quantity: r.quantity,
      })),
    };
    res.json(order);
  } catch (err) {
    console.error('GET /api/orders/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// --- Suppliers CRUD
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      image: r.image ?? '',
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('GET /api/suppliers', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/suppliers/:id/products', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const search = String(req.query.search ?? '').trim();
  try {
    let sql = 'SELECT * FROM products WHERE supplier_id = ?';
    const params = [id];
    if (search) {
      sql += ' AND (name LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    sql += ' ORDER BY name';
    const [rows] = await pool.query(sql, params);
    res.json(rows.map(rowToProduct));
  } catch (err) {
    console.error('GET /api/suppliers/:id/products', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/suppliers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    const r = rows[0];
    if (!r) return res.status(404).json({ error: 'Supplier not found' });
    res.json({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      image: r.image ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('GET /api/suppliers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const b = req.body || {};
  const name = String(b.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address, image) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name,
        String(b.contactPerson ?? b.contact_person ?? ''),
        String(b.email ?? ''),
        String(b.phone ?? ''),
        String(b.address ?? ''),
        String(b.image ?? ''),
      ]
    );
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      image: r.image ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('POST /api/suppliers', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const b = req.body || {};
  const name = String(b.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const [result] = await pool.query(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, image = ? WHERE id = ?',
      [
        name,
        String(b.contactPerson ?? b.contact_person ?? ''),
        String(b.email ?? ''),
        String(b.phone ?? ''),
        String(b.address ?? ''),
        String(b.image ?? ''),
        id,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      image: r.image ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('PUT /api/suppliers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/suppliers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// --- Customers CRUD
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY name');
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('GET /api/customers', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    const r = rows[0];
    if (!r) return res.status(404).json({ error: 'Customer not found' });
    res.json({
      id: r.id,
      name: r.name,
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('GET /api/customers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.post('/api/customers', async (req, res) => {
  const b = req.body || {};
  const name = String(b.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, String(b.email ?? ''), String(b.phone ?? ''), String(b.address ?? '')]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      name: r.name,
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('POST /api/customers', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const b = req.body || {};
  const name = String(b.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const [result] = await pool.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, String(b.email ?? ''), String(b.phone ?? ''), String(b.address ?? ''), id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      email: r.email ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('PUT /api/customers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/customers/:id', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// Admin login: check credentials against admin_users table
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const u = String(username ?? '').trim();
  const p = String(password ?? '');
  if (!u || !p) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1',
      [u]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Ensure hash is a string (mysql2 may return Buffer on some setups)
    const hash = user.password_hash != null ? String(user.password_hash) : '';
    if (!hash) {
      console.error('POST /api/auth/login: missing password_hash for user', u);
      return res.status(500).json({ error: 'Invalid admin user data' });
    }
    const match = await bcrypt.compare(p, hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ ok: true, username: user.username });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
