import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Loader2, UserMinus, Plus } from 'lucide-react';
import { PageHead } from '../../components/ui/PageHead';
import {
  fetchSupplier,
  fetchProductsBySupplier,
  createProduct,
  updateProduct,
} from '../../lib/api';
import { PRODUCT_CATEGORIES } from '../../constants';
import type { Supplier, Product, ProductSpecs } from '../../types';

const CATEGORIES_OPTIONS = PRODUCT_CATEGORIES.filter((c) => c !== 'All');

const initialAddForm = {
  name: '',
  category: 'CCTV',
  price: '',
  description: '',
  image: '',
  installationPrice: '',
  specs: [['', '']] as [string, string][],
  inclusions: [''] as string[],
};

const AdminSupplierProducts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplierId = id ? parseInt(id, 10) : NaN;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(initialAddForm);

  const updateSpec = (i: number, key: 0 | 1, value: string) => {
    setAddForm((prev) => {
      const next = [...prev.specs];
      next[i] = [...next[i]];
      next[i][key] = value;
      return { ...prev, specs: next };
    });
  };
  const addSpecRow = () => setAddForm((prev) => ({ ...prev, specs: [...prev.specs, ['', '']] }));
  const removeSpecRow = (i: number) =>
    setAddForm((prev) => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }));
  const updateInclusion = (i: number, value: string) => {
    setAddForm((prev) => {
      const next = [...prev.inclusions];
      next[i] = value;
      return { ...prev, inclusions: next };
    });
  };
  const addInclusionRow = () => setAddForm((prev) => ({ ...prev, inclusions: [...prev.inclusions, ''] }));
  const removeInclusionRow = (i: number) =>
    setAddForm((prev) => ({ ...prev, inclusions: prev.inclusions.filter((_, idx) => idx !== i) }));

  const loadSupplier = async () => {
    if (Number.isNaN(supplierId)) return;
    try {
      const s = await fetchSupplier(supplierId);
      setSupplier(s ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load supplier');
    }
  };

  const loadProducts = async () => {
    if (Number.isNaN(supplierId)) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchProductsBySupplier(supplierId, search || undefined);
      setProducts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplier();
  }, [supplierId]);

  useEffect(() => {
    loadProducts();
  }, [supplierId, search]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = addForm.name.trim();
    const price = Number(addForm.price);
    const installationPrice = Number(addForm.installationPrice);
    if (!name || !addForm.category) {
      setError('Name and category are required.');
      return;
    }
    if (!window.confirm(`Add product "${name}" to this supplier?`)) return;
    setSaving(true);
    setError(null);
    const specObj: ProductSpecs = {};
    addForm.specs.forEach(([k, v]) => {
      if (k.trim()) specObj[k.trim()] = v.trim();
    });
    const inclusionList = addForm.inclusions.map((s) => s.trim()).filter(Boolean);
    try {
      await createProduct({
        name,
        category: addForm.category,
        price: Number.isNaN(price) ? 0 : price,
        description: addForm.description.trim(),
        fullDescription: addForm.description.trim(),
        image: addForm.image.trim() || 'https://placehold.co/800x600?text=No+Image',
        specs: specObj,
        inclusions: inclusionList,
        installationPrice: Number.isNaN(installationPrice) ? 0 : installationPrice,
        supplierId,
      });
      setAddForm(initialAddForm);
      setShowAddForm(false);
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (productId: number) => {
    if (!window.confirm('Remove this product from this supplier?')) return;
    setSaving(true);
    try {
      await updateProduct(productId, { supplierId: null });
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    } finally {
      setSaving(false);
    }
  };

  if (Number.isNaN(supplierId)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-red-600">Invalid supplier.</p>
        <button type="button" onClick={() => navigate('/admin/suppliers')} className="mt-4 text-aa-cyan hover:underline">
          Back to Suppliers
        </button>
      </div>
    );
  }

  if (!supplier && !error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-aa-cyan" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-red-600">{error || 'Supplier not found.'}</p>
        <button type="button" onClick={() => navigate('/admin/suppliers')} className="mt-4 text-aa-cyan hover:underline">
          Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <PageHead title={`${supplier.name} – Products`} description="Supplier products" />

      <button
        type="button"
        onClick={() => navigate('/admin/suppliers')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 font-medium min-w-0"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span className="truncate">Back to Suppliers</span>
      </button>

      <div className="mb-4 sm:mb-6 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 min-w-0">
          <Package className="h-6 w-6 sm:h-7 sm:w-7 text-aa-cyan shrink-0" />
          <span className="break-words">{supplier.name} – Products</span>
        </h1>
        {supplier.contactPerson && <p className="text-slate-600 text-sm mt-1 truncate">{supplier.contactPerson}</p>}
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      <div className="mb-4 sm:mb-6 min-w-0">
        <div className="relative w-full max-w-md sm:max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full min-w-0 pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-aa-cyan focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-6 sm:mb-8 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Add product</h2>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-aa-cyan text-slate-900 rounded-lg font-medium hover:bg-aa-cyan/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add product
          </button>
        ) : (
          <form onSubmit={handleAddProduct} className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 w-full max-w-2xl min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Category *</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                >
                  {CATEGORIES_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Price (PHP)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Installation price (PHP)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.installationPrice}
                  onChange={(e) => setAddForm({ ...addForm, installationPrice: e.target.value })}
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Image URL</label>
                <input
                  type="text"
                  value={addForm.image}
                  onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-600">Specs (key – value)</label>
                  <button type="button" onClick={addSpecRow} className="text-aa-cyan text-sm font-medium hover:underline">
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {addForm.specs.map(([k, v], i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={k}
                        onChange={(e) => updateSpec(i, 0, e.target.value)}
                        placeholder="Key"
                        className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
                      />
                      <input
                        value={v}
                        onChange={(e) => updateSpec(i, 1, e.target.value)}
                        placeholder="Value"
                        className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
                      />
                      <button type="button" onClick={() => removeSpecRow(i)} className="text-red-600 px-2 shrink-0" aria-label="Remove spec">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-600">Inclusions</label>
                  <button type="button" onClick={addInclusionRow} className="text-aa-cyan text-sm font-medium hover:underline">
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {addForm.inclusions.map((val, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={val}
                        onChange={(e) => updateInclusion(i, e.target.value)}
                        placeholder="e.g. 1x Camera unit"
                        className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm"
                      />
                      <button type="button" onClick={() => removeInclusionRow(i)} className="text-red-600 px-2 shrink-0" aria-label="Remove">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-aa-cyan text-slate-900 rounded-lg font-medium disabled:opacity-60 min-w-[120px]">
                {saving ? 'Adding...' : 'Add product'}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setError(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Products ({products.length})</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-aa-cyan" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center text-slate-500 text-sm sm:text-base">
          No products yet. Click Add product above to add one for this supplier.
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="block md:hidden space-y-3 min-w-0">
            {products.map((p) => {
              const specEntries = p.specs && typeof p.specs === 'object' ? Object.entries(p.specs) : [];
              const specText = specEntries.length ? specEntries.map(([k, v]) => `${k}: ${v}`).join(' · ') : '';
              const inclusionList = Array.isArray(p.inclusions) ? p.inclusions.filter(Boolean) : [];
              return (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-slate-500 text-sm">
                        {p.category} · PHP {Number(p.price).toLocaleString()}
                        {Number(p.installationPrice ?? 0) > 0 && ` · Install: PHP ${Number(p.installationPrice).toLocaleString()}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnassign(p.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 text-sm font-medium shrink-0 self-start sm:self-center"
                      title="Remove from this supplier"
                    >
                      <UserMinus className="h-4 w-4" />
                      Unassign
                    </button>
                  </div>
                  {(specText || inclusionList.length > 0) && (
                    <div className="border-t border-slate-100 pt-2 space-y-1 text-xs text-slate-600">
                      {specText && (
                        <p className="min-w-0" title={specText}>
                          <span className="font-medium text-slate-500">Specs:</span>{' '}
                          <span className="line-clamp-2">{specText}</span>
                        </p>
                      )}
                      {inclusionList.length > 0 && (
                        <p className="min-w-0" title={inclusionList.join(', ')}>
                          <span className="font-medium text-slate-500">Inclusions:</span>{' '}
                          <span className="line-clamp-2">{inclusionList.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[400px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Name</th>
                    <th className="p-3 font-semibold text-slate-700">Category</th>
                    <th className="p-3 font-semibold text-slate-700">Price</th>
                    <th className="p-3 font-semibold text-slate-700">Install</th>
                    <th className="p-3 font-semibold text-slate-700 min-w-[140px]">Specs</th>
                    <th className="p-3 font-semibold text-slate-700 min-w-[120px]">Inclusions</th>
                    <th className="p-3 font-semibold text-slate-700 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const specEntries = p.specs && typeof p.specs === 'object' ? Object.entries(p.specs) : [];
                    const specText = specEntries.length ? specEntries.map(([k, v]) => `${k}: ${v}`).join(' · ') : '—';
                    const inclusionList = Array.isArray(p.inclusions) ? p.inclusions.filter(Boolean) : [];
                    const inclusionText = inclusionList.length ? inclusionList.join(', ') : '—';
                    return (
                      <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-900">{p.name}</td>
                        <td className="p-3 text-slate-600">{p.category}</td>
                        <td className="p-3 text-slate-600">PHP {Number(p.price).toLocaleString()}</td>
                        <td className="p-3 text-slate-600">PHP {Number(p.installationPrice ?? 0).toLocaleString()}</td>
                        <td className="p-3 text-slate-600 text-sm max-w-[200px]" title={specText}>
                          <span className="line-clamp-2">{specText}</span>
                        </td>
                        <td className="p-3 text-slate-600 text-sm max-w-[180px]" title={inclusionText}>
                          <span className="line-clamp-2">{inclusionText}</span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleUnassign(p.id)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50 text-sm font-medium"
                            title="Remove from this supplier"
                          >
                            <UserMinus className="h-4 w-4" />
                            Unassign
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSupplierProducts;
