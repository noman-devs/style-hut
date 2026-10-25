import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Users, Search, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  joinedDate: string;
}

const mockCustomers: CustomerRecord[] = [
  {
    id: 'c-1',
    name: 'Tasnim Rahman',
    email: 'tasnim@example.com',
    phone: '01712345678',
    totalOrders: 3,
    totalSpent: 18450,
    status: 'active',
    joinedDate: '2026-08-15',
  },
  {
    id: 'c-2',
    name: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    phone: '01898765432',
    totalOrders: 2,
    totalSpent: 8200,
    status: 'active',
    joinedDate: '2026-09-02',
  },
  {
    id: 'c-3',
    name: 'Samia Farhana',
    email: 'samia@example.com',
    phone: '01923456789',
    totalOrders: 1,
    totalSpent: 2450,
    status: 'active',
    joinedDate: '2026-10-10',
  },
];

export const Customers: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>(mockCustomers);
  const [search, setSearch] = useState('');

  const handleToggleStatus = (customerId: string) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const nextStatus = c.status === 'active' ? 'blocked' : 'active';
          showToast(`Customer account ${nextStatus === 'blocked' ? 'blocked' : 'activated'}`, 'info');
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const filtered = customers.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) ||
         c.phone.includes(search) ||
         c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
          Customer Directory
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Registered customer accounts, contact details, and account standing
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-soft">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers by name, phone, or email..."
            className="w-full pl-9 pr-4 py-2 bg-brand-ivory/50 border border-brand-border rounded-xl text-xs text-brand-dark focus:bg-white focus:outline-none focus:border-brand-pink"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-ivory/60 text-brand-dark/70 uppercase text-[10px] tracking-wider font-bold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Orders</th>
                <th className="px-6 py-3.5">Total Spent</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-brand-softPink/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-dark">{customer.name}</div>
                    <div className="text-[10px] text-brand-muted">Joined: {customer.joinedDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-brand-dark">
                      <Phone className="w-3 h-3 text-brand-rose" /> {customer.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-brand-muted mt-0.5">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-dark">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 font-serif font-bold text-brand-rose">
                    ৳{customer.totalSpent.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      customer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(customer.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        customer.status === 'active'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {customer.status === 'active' ? 'Block Account' : 'Unblock Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
