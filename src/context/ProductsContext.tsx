import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import * as api from '../lib/api';

const PRODUCTS_STORAGE_KEY = 'aa2000-products';

function loadProductsFromStorage(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: unknown) => ({
      id: Number((p as Product).id),
      name: String((p as Product).name ?? ''),
      category: String((p as Product).category ?? ''),
      price: Number((p as Product).price ?? 0),
      description: String((p as Product).description ?? ''),
      fullDescription: String((p as Product).fullDescription ?? ''),
      image: String((p as Product).image ?? ''),
      specs: typeof (p as Product).specs === 'object' && (p as Product).specs !== null
        ? (p as Product).specs
        : {},
      inclusions: Array.isArray((p as Product).inclusions) ? (p as Product).inclusions : [],
      installationPrice: Number((p as Product).installationPrice ?? 0),
      supplierId: (p as Product).supplierId != null ? Number((p as Product).supplierId) : null,
      supplierName: (p as Product).supplierName != null ? String((p as Product).supplierName) : null,
    }));
  } catch {
    return [];
  }
}

function saveProductsToStorage(products: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  useApi: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  refetch: () => Promise<void>;
  /** Refetch from API in background (no loading state) for realtime sync */
  refetchSilent: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApi, setUseApi] = useState(false);

  const fetchFromApi = useCallback(async () => {
    try {
      const data = await api.fetchProducts();
      setProducts(data);
      setUseApi(true);
      setError(null);
      return data;
    } catch {
      setUseApi(false);
      setProducts(loadProductsFromStorage());
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchFromApi();
  }, [fetchFromApi]);

  const refetchSilent = useCallback(async () => {
    try {
      const data = await api.fetchProducts();
      setProducts(data);
      setUseApi(true);
      setError(null);
    } catch {
      setUseApi(false);
      setProducts(loadProductsFromStorage());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.fetchProducts();
        if (!cancelled) {
          setProducts(data);
          setUseApi(true);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setUseApi(false);
          setProducts(loadProductsFromStorage());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!useApi && products.length >= 0) saveProductsToStorage(products);
  }, [useApi, products]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    if (useApi) {
      const created = await api.createProduct(product);
      setProducts((prev) => [...prev, created]);
      return created;
    }
    const nextId =
      products.length === 0 ? 1 : Math.max(...products.map((p) => p.id), 0) + 1;
    const newProduct: Product = {
      ...product,
      id: nextId,
      specs: product.specs ?? {},
      inclusions: product.inclusions ?? [],
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, [useApi, products.length]);

  const updateProduct = useCallback(async (id: number, updates: Partial<Omit<Product, 'id'>>) => {
    if (useApi) {
      const updated = await api.updateProduct(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, [useApi]);

  const deleteProduct = useCallback(async (id: number) => {
    if (useApi) {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [useApi]);

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  const value: ProductsContextType = {
    products,
    loading,
    error,
    useApi,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refetch,
    refetchSilent,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
