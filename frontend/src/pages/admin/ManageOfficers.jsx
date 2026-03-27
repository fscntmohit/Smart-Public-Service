import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, UserPlus } from 'lucide-react';
import { getOfficers, createOfficer, updateOfficer, deleteOfficer } from '../../services/userService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Waste', 'Electricity', 'Water', 'Road', 'Other'];
const AREAS = ['Alpha 1', 'Alpha 2', 'Beta 1', 'Beta 2', 'Gamma 1'];

export default function ManageOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    clerkId: '', name: '', email: '', department: '', area: '',
  });

  useEffect(() => { loadOfficers(); }, []);

  const loadOfficers = async () => {
    try {
      const { data } = await getOfficers();
      setOfficers(data);
    } catch (err) {
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ clerkId: '', name: '', email: '', department: '', area: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (officer) => {
    setForm({
      clerkId: officer.clerkId,
      name: officer.name,
      email: officer.email,
      department: officer.department,
      area: officer.area,
    });
    setEditId(officer._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateOfficer(editId, form);
        toast.success('Officer updated!');
      } else {
        if (!form.clerkId) {
          toast.error('Clerk ID is required for new officers');
          return;
        }
        await createOfficer(form);
        toast.success('Officer added!');
      }
      resetForm();
      loadOfficers();
    } catch (err) {
      toast.error('Failed to save officer');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this officer?')) return;
    try {
      await deleteOfficer(id);
      toast.success('Officer deleted');
      loadOfficers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Officers</h1>
          <p className="text-sm text-slate-500 mt-1">{officers.length} officers</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Officer
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {editId ? 'Edit Officer' : 'Add Officer'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clerk ID *</label>
                  <input
                    value={form.clerkId}
                    onChange={(e) => setForm({ ...form, clerkId: e.target.value })}
                    placeholder="user_xxx"
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Officer name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="officer@email.com"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                  <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field">
                    <option value="">Select</option>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editId ? 'Update' : 'Add Officer'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {officers.length === 0 ? (
        <EmptyState title="No officers" description="Add officers to start assigning complaints." icon={UserPlus} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Area</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-slate-700">{o.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{o.email || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{o.department || '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{o.area || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(o)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(o._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
