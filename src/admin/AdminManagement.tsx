import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  getAdminUsersList, 
  createAdminAccount, 
  updateAdminAccount,
  deleteAdminAccount, 
  toggleAdminAccountStatus,
  AdminUserItem 
} from '../services/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Mail, 
  Phone, 
  Lock, 
  X,
  AlertTriangle,
  RefreshCw,
  Pencil
} from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [admins, setAdmins] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin');
  const [formError, setFormError] = useState('');

  // Edit form state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'super_admin'>('admin');
  const [editStatus, setEditStatus] = useState<'active' | 'blocked'>('active');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsersList();
      setAdmins(data);
    } catch (e) {
      console.error(e);
      showToast('Failed to load administrator accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    }
  }, [isSuperAdmin]);

  // If not super admin, restrict view
  if (!isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-dark">Super Admin Authorization Required</h1>
        <p className="text-xs text-brand-muted leading-relaxed">
          Regular administrators cannot view or manage other administrators. Only the root Super Admin possesses privileges to add, configure, or revoke staff access.
        </p>
      </div>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAdminAccount({
        name,
        email,
        phone,
        password,
        role,
      });

      if (res.success) {
        showToast(`Administrator ${name} created successfully!`, 'success');
        setModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setRole('admin');
        await loadAdmins();
      } else {
        setFormError(res.message || 'Failed to create administrator.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (admin: AdminUserItem) => {
    setEditingAdmin(admin);
    setEditName(admin.full_name || '');
    setEditPhone(admin.phone || '');
    setEditRole(admin.role === 'super_admin' ? 'super_admin' : 'admin');
    setEditStatus(admin.account_status || 'active');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditError('');
    setEditSubmitting(true);

    try {
      const res = await updateAdminAccount(editingAdmin.id, {
        full_name: editName.trim(),
        phone: editPhone.trim(),
        role: editRole,
        account_status: editStatus,
      });

      if (res.success) {
        showToast(`Administrator "${editName}" updated successfully!`, 'success');
        setEditModalOpen(false);
        setAdmins(prev =>
          prev.map(a =>
            a.id === editingAdmin.id
              ? {
                  ...a,
                  full_name: editName.trim(),
                  phone: editPhone.trim(),
                  role: editRole,
                  account_status: editStatus,
                }
              : a
          )
        );
      } else {
        setEditError(res.message || 'Failed to update administrator.');
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminUserItem) => {
    if (admin.email === 'sohel229229@gmail.com') {
      showToast('Cannot block the primary Root Super Admin account', 'info');
      return;
    }

    const nextStatus = admin.account_status === 'active' ? 'blocked' : 'active';
    setActionLoadingId(admin.id);

    try {
      const res = await toggleAdminAccountStatus(admin.id, nextStatus);
      if (res.success) {
        showToast(`Administrator status changed to ${nextStatus}`, 'success');
        setAdmins(prev =>
          prev.map(a => (a.id === admin.id ? { ...a, account_status: nextStatus } : a))
        );
      } else {
        showToast(res.message || 'Could not update status', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error updating status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (admin: AdminUserItem) => {
    if (admin.email === 'sohel229229@gmail.com') {
      showToast('Cannot delete primary Root Super Admin account', 'info');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently remove administrator "${admin.full_name}" (${admin.email})?`)) {
      return;
    }

    setActionLoadingId(admin.id);
    try {
      const res = await deleteAdminAccount(admin.id);
      if (res.success) {
        showToast('Administrator removed successfully', 'success');
        setAdmins(prev => prev.filter(a => a.id !== admin.id));
      } else {
        showToast(res.message || 'Failed to remove administrator', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error deleting account', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalAdmins = admins.length;
  const superAdminCount = admins.filter(a => a.role === 'super_admin').length;
  const activeCount = admins.filter(a => a.account_status === 'active').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
              Administrators & Staff
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-brand-dark border border-brand-gold/40">
              Super Admin Privilege
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Create, edit, manage and control access permissions for Style Hut administrators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAdmins}
            disabled={loading}
            className="p-2.5 bg-white border border-brand-border hover:bg-gray-50 text-brand-dark rounded-xl transition-colors shadow-soft"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => {
              setFormError('');
              setModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-elevated transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border/60 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Total Admin Staff</span>
          <p className="font-serif text-2xl font-bold text-brand-dark mt-1">{totalAdmins}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border/60 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Super Admins</span>
          <p className="font-serif text-2xl font-bold text-brand-rose mt-1">{superAdminCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border/60 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Active Status</span>
          <p className="font-serif text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Administrators List Table */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-brand-dark">Authorized Staff Members</h2>
          <span className="text-xs text-brand-muted">Showing {admins.length} accounts</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-brand-muted">Loading administrators...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-brand-muted mx-auto" />
            <p className="text-xs font-bold text-brand-dark">No administrators found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-ivory/50 border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Administrator</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Contact Phone</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map(admin => {
                  const isRoot = admin.email === 'sohel229229@gmail.com';

                  return (
                    <tr key={admin.id} className="hover:bg-brand-softPink/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            admin.role === 'super_admin' ? 'bg-brand-rose text-white' : 'bg-brand-softPink text-brand-rose'
                          }`}>
                            {admin.full_name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-brand-dark flex items-center gap-1.5">
                              <span>{admin.full_name}</span>
                              {isRoot && (
                                <span className="text-[9px] bg-brand-gold/30 text-brand-dark font-extrabold px-1.5 py-0.5 rounded">
                                  Root Super Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-brand-muted font-mono">{admin.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {admin.role === 'super_admin' ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            SUPER ADMIN
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            ADMIN
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-brand-dark font-medium">
                        {admin.phone || '—'}
                      </td>

                      <td className="py-4 px-6">
                        {admin.account_status === 'active' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Blocked
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(admin)}
                            className="p-1.5 rounded-lg border border-brand-border text-brand-dark hover:bg-brand-softPink/40 transition-colors"
                            title="Edit Administrator"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Block/Activate toggle */}
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            disabled={isRoot || actionLoadingId === admin.id}
                            className={`p-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-30 ${
                              admin.account_status === 'active'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isRoot ? 'Root Super Admin cannot be blocked' : admin.account_status === 'active' ? 'Block Admin' : 'Activate Admin'}
                          >
                            {admin.account_status === 'active' ? 'Block' : 'Activate'}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(admin)}
                            disabled={isRoot || actionLoadingId === admin.id}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                            title={isRoot ? 'Root Super Admin cannot be deleted' : 'Delete account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* EDIT ADMINISTRATOR MODAL */}
      {editModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-elevated max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-brand-ivory/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark">Edit Administrator</h3>
                  <p className="text-[11px] text-brand-muted">{editingAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full px-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Account Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editStatus === 'active'}
                      onChange={() => setEditStatus('active')}
                    />
                    <span className="font-semibold text-emerald-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editStatus === 'blocked'}
                      onChange={() => setEditStatus('blocked')}
                    />
                    <span className="font-semibold text-rose-700">Blocked</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">
                  Privilege Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    editRole === 'admin'
                      ? 'border-brand-pink bg-brand-softPink/30 ring-1 ring-brand-pink'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="editRole"
                      value="admin"
                      checked={editRole === 'admin'}
                      onChange={() => setEditRole('admin')}
                      className="sr-only"
                    />
                    <div className="font-bold text-xs text-brand-dark">Regular Admin</div>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      Store management only
                    </p>
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    editRole === 'super_admin'
                      ? 'border-brand-gold bg-amber-50/50 ring-1 ring-brand-gold'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="editRole"
                      value="super_admin"
                      checked={editRole === 'super_admin'}
                      onChange={() => setEditRole('super_admin')}
                      className="sr-only"
                    />
                    <div className="font-bold text-xs text-brand-dark flex items-center gap-1">
                      <span>Super Admin</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                    </div>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      Full staff control
                    </p>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-elevated transition-colors"
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ADD ADMINISTRATOR MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border shadow-elevated max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-brand-ivory/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-softPink text-brand-rose flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark">Create Administrator</h3>
                  <p className="text-[11px] text-brand-muted">Grant administrative dashboard privileges</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full px-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@stylehutbd.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                  />
                  <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                  />
                  <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
                  />
                  <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-2">
                  Access Level & Privileges *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    role === 'admin'
                      ? 'border-brand-pink bg-brand-softPink/30 ring-1 ring-brand-pink'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="sr-only"
                    />
                    <div className="font-bold text-xs text-brand-dark">Regular Admin</div>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      Can manage products, orders, categories & stock. Cannot manage admins.
                    </p>
                  </label>

                  <label className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    role === 'super_admin'
                      ? 'border-brand-gold bg-amber-50/50 ring-1 ring-brand-gold'
                      : 'border-brand-border bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={role === 'super_admin'}
                      onChange={() => setRole('super_admin')}
                      className="sr-only"
                    />
                    <div className="font-bold text-xs text-brand-dark flex items-center gap-1">
                      <span>Super Admin</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                    </div>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      Full control including staff creation and system permissions.
                    </p>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-brand-border text-xs font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 rounded-xl bg-brand-pink hover:bg-brand-rose text-white text-xs font-bold shadow-elevated transition-colors flex items-center gap-2"
                >
                  {submitting ? 'Creating Staff Account...' : 'Create Staff Member'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
