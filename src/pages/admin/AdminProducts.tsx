import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, ExternalLink } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import type { Product, ProductSpecs } from '../../types';
import { productSchema } from '../../lib/validations';
import { PageHead } from '../../components/ui/PageHead';
import { PRODUCT_CATEGORIES } from '../../constants';

const CATEGORIES_FOR_SELECT = PRODUCT_CATEGORIES.filter((c) => c !== 'All');

function ProductForm({
  product,
  onSubmit,
  onCancel,
  saving = false,
}: {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? 'CCTV');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? '');
  const [fullDescription, setFullDescription] = useState(product?.fullDescription ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [installationPrice, setInstallationPrice] = useState(product?.installationPrice ?? 0);
  const [specs, setSpecs] = useState<[string, string][]>(
    product?.specs ? Object.entries(product.specs) : [['', '']]
  );
  const [inclusions, setInclusions] = useState<string[]>(
    product?.inclusions?.length ? product.inclusions : ['']
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateSpec = (i: number, key: 0 | 1, value: string) => {
    setSpecs((prev) => {
      const next = [...prev];
      next[i] = [...next[i]];
      next[i][key] = value;
      return next;
    });
  };
  const addSpec = () => setSpecs((prev) => [...prev, ['', '']]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  const updateInclusion = (i: number, value: string) => {
    setInclusions((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };
  const addInclusion = () => setInclusions((prev) => [...prev, '']);
  const removeInclusion = (i: number) =>
    setInclusions((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price);
    const numInstall = Number(installationPrice);
    const result = productSchema.safeParse({
      name,
      category,
      price: numPrice,
      description,
      fullDescription,
      image: image.trim() || '',
      installationPrice: numInstall,
    });
    if (!result.success) {
      const err: Record<string, string> = {};
      result.error.flatten().fieldErrors?.name?.[0] && (err.name = result.error.flatten().fieldErrors.name[0]);
      result.error.flatten().fieldErrors?.category?.[0] && (err.category = result.error.flatten().fieldErrors.category[0]);
      result.error.flatten().fieldErrors?.price?.[0] && (err.price = result.error.flatten().fieldErrors.price[0]);
      result.error.flatten().fieldErrors?.description?.[0] && (err.description = result.error.flatten().fieldErrors.description[0]);
      result.error.flatten().fieldErrors?.fullDescription?.[0] && (err.fullDescription = result.error.flatten().fieldErrors.fullDescription[0]);
      result.error.flatten().fieldErrors?.image?.[0] && (err.image = result.error.flatten().fieldErrors.image[0]);
      result.error.flatten().fieldErrors?.installationPrice?.[0] && (err.installationPrice = result.error.flatten().fieldErrors.installationPrice[0]);
      setErrors(err);
      return;
    }
    setErrors({});
    const specObj: ProductSpecs = {};
    specs.forEach(([k, v]) => {
      if (k.trim()) specObj[k.trim()] = v.trim();
    });
    const incList = inclusions.map((s) => s.trim()).filter(Boolean);
    onSubmit({
      name: result.data.name,
      category: result.data.category,
      price: result.data.price,
      description: result.data.description,
      fullDescription: result.data.fullDescription,
      image: result.data.image || 'https://placehold.co/800x600?text=No+Image',
      specs: specObj,
      inclusions: incList,
      installationPrice: result.data.installationPrice,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit product' : 'Add product'}</h2>
      <p className="text-slate-500 text-sm -mt-2">{isEdit ? 'Update the fields below and save.' : 'Fill in the details for the new product.'}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
          >
            {CATEGORIES_FOR_SELECT.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price (PHP)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={price || ''}
            onChange={(e) => setPrice(e.target.value === '' ? 0 : parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
          />
          {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Installation price (PHP)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={installationPrice || ''}
            onChange={(e) => setInstallationPrice(e.target.value === '' ? 0 : parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
          />
          {errors.installationPrice && <p className="text-red-600 text-sm mt-1">{errors.installationPrice}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Short description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full description</label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
        />
        {errors.fullDescription && <p className="text-red-600 text-sm mt-1">{errors.fullDescription}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-aa-blue"
        />
        {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">Specs (key – value)</label>
          <button type="button" onClick={addSpec} className="text-aa-blue text-sm font-medium">+ Add</button>
        </div>
        <div className="space-y-2">
          {specs.map(([k, v], i) => (
            <div key={i} className="flex gap-2">
              <input
                value={k}
                onChange={(e) => updateSpec(i, 0, e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                value={v}
                onChange={(e) => updateSpec(i, 1, e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => removeSpec(i)} className="text-red-600 px-2">×</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">Inclusions</label>
          <button type="button" onClick={addInclusion} className="text-aa-blue text-sm font-medium">+ Add</button>
        </div>
        <div className="space-y-2">
          {inclusions.map((val, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={val}
                onChange={(e) => updateInclusion(i, e.target.value)}
                placeholder="e.g. 1x Camera unit"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => removeInclusion(i)} className="text-red-600 px-2">×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-aa-blue text-slate-900 font-bold rounded-lg hover:bg-aa-blue-dark disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save' : 'Add product'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </form>
  );
}

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, refetchSilent, loading, error, useApi } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredProducts =
    categoryFilter === 'All'
      ? products
      : products.filter((p) => p.category === categoryFilter);

  const editingProduct = editingId != null ? products.find((p) => p.id === editingId) : null;

  const handleSubmit = async (data: Omit<Product, 'id'>) => {
    const message =
      editingId != null
        ? `Save changes to product "${data.name}"?`
        : `Add new product "${data.name}"?`;
    if (!window.confirm(message)) return;
    setSubmitError(null);
    setSaving(true);
    try {
      if (editingId != null) {
        await updateProduct(editingId, data);
        setEditingId(null);
      } else {
        await addProduct(data);
        setShowForm(false);
      }
      await refetchSilent();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setSubmitError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await deleteProduct(id);
      await refetchSilent();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead title="Admin – Products" />
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          Could not load from database. Using local storage. Check your API and MySQL config.
        </div>
      )}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">{submitError}</div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 sm:h-7 sm:w-7 text-aa-cyan shrink-0" />
            Products
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {useApi ? 'Connected to MySQL.' : 'Using local storage.'}{' '}
            {categoryFilter === 'All'
              ? `${products.length} product${products.length !== 1 ? 's' : ''}`
              : `${filteredProducts.length} of ${products.length} (${categoryFilter})`}
            .
          </p>
        </div>
        {!showForm && !editingProduct && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-aa-blue text-slate-900 font-bold rounded-lg hover:bg-aa-blue-dark shadow-sm transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        )}
      </div>

      {(showForm || editingProduct) && (
        <div className="mb-8">
          <ProductForm
            product={editingProduct ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            saving={saving}
          />
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-slate-600 text-sm font-medium mr-1">Filter:</span>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-aa-blue text-slate-900 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 sm:p-16 text-center text-slate-500">Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              {products.length === 0
                ? 'No products yet'
                : `No products in ${categoryFilter}`}
            </p>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {products.length === 0
                ? 'Add your first product to get started.'
                : 'Try another filter or add a product in this category.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-aa-blue text-slate-900 font-bold rounded-lg hover:bg-aa-blue-dark"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            )}
            {products.length > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter('All')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Show all
              </button>
            )}
            <p className="mt-4">
              <Link to="/products" className="text-aa-blue font-medium text-sm inline-flex items-center gap-1">
                View public Products page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Image</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Name</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Category</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Supplier</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Price</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Install</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm min-w-[120px]">Specs</th>
                  <th className="text-left py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm min-w-[100px]">Inclusions</th>
                  <th className="text-right py-3.5 px-3 sm:px-5 text-slate-600 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
              {filteredProducts.map((p) => {
                const specEntries = p.specs && typeof p.specs === 'object' ? Object.entries(p.specs) : [];
                const specText = specEntries.length ? specEntries.map(([k, v]) => `${k}: ${v}`).join(' · ') : '—';
                const inclusionList = Array.isArray(p.inclusions) ? p.inclusions.filter(Boolean) : [];
                const inclusionText = inclusionList.length ? inclusionList.join(', ') : '—';
                return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 sm:px-5">
                    <img src={p.image} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg" />
                  </td>
                  <td className="py-3 px-3 sm:px-5 font-medium text-slate-900 min-w-[120px]">{p.name}</td>
                  <td className="py-3 px-3 sm:px-5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs sm:text-sm">{p.category}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-5 text-slate-600 text-sm">
                    {p.supplierName ? (
                      <Link to={`/admin/suppliers/${p.supplierId}/products`} className="text-aa-cyan hover:underline">
                        {p.supplierName}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:px-5 text-slate-700 font-medium whitespace-nowrap">PHP {p.price.toLocaleString()}</td>
                  <td className="py-3 px-3 sm:px-5 text-slate-600 text-sm whitespace-nowrap">PHP {Number(p.installationPrice ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-3 sm:px-5 text-slate-600 text-sm max-w-[160px]" title={specText}>
                    <span className="line-clamp-2">{specText}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-5 text-slate-600 text-sm max-w-[140px]" title={inclusionText}>
                    <span className="line-clamp-2">{inclusionText}</span>
                  </td>
                  <td className="py-3 px-3 sm:px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingId(p.id); setShowForm(false); }}
                        className="p-2 text-slate-500 hover:text-aa-blue hover:bg-aa-blue/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/products/${p.id}`}
                        className="p-2 text-slate-500 hover:text-aa-blue hover:bg-aa-blue/10 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                        title="View on site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProducts;
