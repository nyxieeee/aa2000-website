import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Plus, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import { PageHead } from '../../components/ui/PageHead';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../lib/api';
import type { Supplier } from '../../types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x240?text=Supplier';

const AdminSuppliers = () => {
  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    image: '',
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', image: '' });
    setShowForm(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name,
      contactPerson: s.contactPerson ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      address: s.address ?? '',
      image: s.image ?? '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const message = editing
      ? `Update supplier "${form.name}"?`
      : `Add new supplier "${form.name}"?`;
    if (!window.confirm(message)) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        image: (form.image ?? '').trim(),
      };
      if (editing) {
        await updateSupplier(editing.id, payload);
      } else {
        await createSupplier(payload);
      }
      closeForm();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const supplierImage = (s: Supplier) => {
    const url = (s.image ?? '').toString().trim();
    return url ? url : PLACEHOLDER_IMAGE;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="Suppliers" description="AA2000 Admin - Suppliers" />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Truck className="h-7 w-7 text-aa-cyan" />
          Suppliers
        </h1>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-aa-cyan text-slate-900 rounded-lg font-medium hover:bg-aa-cyan/90"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Image URL (picture for card)</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/image.jpg (saved to database)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
              {form.image && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 w-40 h-24 bg-slate-100">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-aa-cyan text-slate-900 rounded-lg font-medium disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={closeForm} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-aa-cyan" />
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
          No suppliers yet. Click Add Supplier to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[5/3] bg-slate-100 relative overflow-hidden">
                <img
                  src={supplierImage(s)}
                  alt={s.name}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (el.src !== PLACEHOLDER_IMAGE) el.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate" title={s.name}>{s.name}</h3>
                {s.contactPerson && <p className="text-sm text-slate-600 truncate mt-0.5">{s.contactPerson}</p>}
                {s.email && <p className="text-sm text-slate-500 truncate">{s.email}</p>}
                {s.phone && <p className="text-sm text-slate-500 truncate">{s.phone}</p>}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                  <Link
                    to={`/admin/suppliers/${s.id}/products`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-aa-cyan hover:bg-aa-cyan/10 text-sm font-medium border border-aa-cyan/30"
                  >
                    <Package className="h-4 w-4" />
                    Products
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminSuppliers;
