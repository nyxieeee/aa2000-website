import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { PageHead } from '../../components/ui/PageHead';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../lib/api';
import type { Customer } from '../../types';

const AdminCustomers = () => {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers();
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
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
      ? `Update customer "${form.name}"?`
      : `Add new customer "${form.name}"?`;
    if (!window.confirm(message)) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, form);
      } else {
        await createCustomer(form);
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
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHead title="Customers" description="AA2000 Admin - Customers" />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-7 w-7 text-aa-cyan" />
          Customers
        </h1>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-aa-cyan text-slate-900 rounded-lg font-medium hover:bg-aa-cyan/90"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-aa-cyan" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No customers yet. Click &quot;Add Customer&quot; to add one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold text-slate-700">Name</th>
                  <th className="p-3 font-semibold text-slate-700">Email</th>
                  <th className="p-3 font-semibold text-slate-700">Phone</th>
                  <th className="p-3 font-semibold text-slate-700">Address</th>
                  <th className="p-3 font-semibold text-slate-700 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-900">{c.name}</td>
                    <td className="p-3 text-slate-600">{c.email || '—'}</td>
                    <td className="p-3 text-slate-600">{c.phone || '—'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="p-3 flex gap-2">
                      <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded text-slate-600 hover:bg-slate-200" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(c.id)} className="p-1.5 rounded text-red-600 hover:bg-red-50" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
