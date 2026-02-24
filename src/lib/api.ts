import type { Product, Order, OrderPayload, Supplier, Customer } from '../types';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  return '';
};

export async function fetchProductsUnassigned(): Promise<Product[]> {
  const res = await fetch(`${getBaseUrl()}/api/products/unassigned`);
  if (!res.ok) throw new Error('Failed to fetch unassigned products');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Fetches all products by loading each supplier's products + unassigned. Ensures supplier is always present. */
export async function fetchProductsFromSuppliers(): Promise<Product[]> {
  const base = getBaseUrl();
  const [suppliers, unassigned] = await Promise.all([
    fetch(`${base}/api/suppliers`).then((r) => (r.ok ? r.json() : [])),
    fetch(`${base}/api/products/unassigned`).then((r) => (r.ok ? r.json() : [])),
  ]);
  const bySupplier = await Promise.all(
    (suppliers as Supplier[]).map((s) =>
      fetchProductsBySupplier(s.id).then((products) =>
        products.map((p) => ({ ...p, supplierId: s.id, supplierName: s.name }))
      )
    )
  );
  const combined: Product[] = [...(Array.isArray(unassigned) ? unassigned : []), ...bySupplier.flat()];
  combined.sort((a, b) => a.id - b.id);
  return combined;
}

export async function fetchProducts(): Promise<Product[]> {
  return fetchProductsFromSuppliers();
}

export async function fetchProductsBySupplier(supplierId: number, search?: string): Promise<Product[]> {
  const base = getBaseUrl();
  const url = search
    ? `${base}/api/suppliers/${supplierId}/products?search=${encodeURIComponent(search)}`
    : `${base}/api/suppliers/${supplierId}/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchProduct(id: number): Promise<Product | null> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${getBaseUrl()}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, { method: 'DELETE' });
  if (res.status !== 204 && !res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to delete product');
  }
}

export async function submitOrder(order: OrderPayload): Promise<Order> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to submit order');
  }
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${getBaseUrl()}/api/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchOrder(id: number): Promise<Order | null> {
  const res = await fetch(`${getBaseUrl()}/api/orders/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

const base = () => getBaseUrl();

export async function fetchSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${base()}/api/suppliers`);
  if (!res.ok) throw new Error('Failed to fetch suppliers');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchSupplier(id: number): Promise<Supplier | null> {
  const res = await fetch(`${base()}/api/suppliers/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch supplier');
  return res.json();
}

export async function createSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
  const res = await fetch(`${base()}/api/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to create supplier');
  }
  return res.json();
}

export async function updateSupplier(id: number, supplier: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> {
  const res = await fetch(`${base()}/api/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplier),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to update supplier');
  }
  return res.json();
}

export async function deleteSupplier(id: number): Promise<void> {
  const res = await fetch(`${base()}/api/suppliers/${id}`, { method: 'DELETE' });
  if (res.status !== 204 && !res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to delete supplier');
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${base()}/api/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
  const res = await fetch(`${base()}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to create customer');
  }
  return res.json();
}

export async function updateCustomer(id: number, customer: Partial<Omit<Customer, 'id'>>): Promise<Customer> {
  const res = await fetch(`${base()}/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to update customer');
  }
  return res.json();
}

export async function deleteCustomer(id: number): Promise<void> {
  const res = await fetch(`${base()}/api/customers/${id}`, { method: 'DELETE' });
  if (res.status !== 204 && !res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to delete customer');
  }
}
