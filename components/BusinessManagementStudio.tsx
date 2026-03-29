
import React, { useState } from 'react';
import { LayoutDashboard, Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, Users, Settings, Plus, Search, Filter, Download, Shield } from 'lucide-react';

export const BusinessManagementStudio: React.FC = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: "Business Card Stock", stock: 120, minStock: 200, unit: "Sheets" },
    { id: 2, name: "Laminating Pouches", stock: 45, minStock: 50, unit: "Packs" },
    { id: 3, name: "Vinyl Rolls (Black)", stock: 12, minStock: 5, unit: "Rolls" },
    { id: 4, name: "T-Shirt Blanks (M)", stock: 8, minStock: 15, unit: "Shirts" }
  ]);

  const [orders, setOrders] = useState([
    { id: "ORD-001", customer: "John Doe", status: "Pending", total: 250.00, date: "2026-03-22" },
    { id: "ORD-002", customer: "Jane Smith", status: "Completed", total: 969.00, date: "2026-03-21" },
    { id: "ORD-003", customer: "Bob Wilson", status: "Processing", total: 150.00, date: "2026-03-20" }
  ]);

  const stats = [
    { label: "Total Revenue", value: "$1,369.00", icon: <DollarSign className="text-green-500" />, trend: "+12%" },
    { label: "Total Orders", value: "3", icon: <ShoppingCart className="text-blue-500" />, trend: "+5%" },
    { label: "Profit Margin", value: "68%", icon: <TrendingUp className="text-brand-teal" />, trend: "+2%" },
    { label: "Active Clients", value: "3", icon: <Users className="text-brand-lavender" />, trend: "+1" }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="text-brand-lavender" />
            <h2 className="text-3xl font-serif font-black text-brand-black tracking-tight">Business Management Hub</h2>
          </div>
          <p className="text-stone-500 font-medium max-w-xl">
            A preview of the custom management dashboard included in the <span className="text-brand-black font-bold">Premium Legacy Suite</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-brand-black text-white rounded-xl text-xs font-black hover:bg-brand-lavender transition-all shadow-lg flex items-center gap-2">
                <Plus size={16} /> New Order
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass p-8 rounded-[2.5rem] border-white shadow-xl bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-stone-50 rounded-2xl">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-brand-black">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Inventory Management */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-brand-black flex items-center gap-3">
              <Package size={20} className="text-brand-teal" /> Inventory Alerts
            </h3>
            <button className="text-[10px] font-black text-brand-teal uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="glass rounded-[3rem] p-8 shadow-xl border-white bg-white space-y-4">
            {inventory.map((item) => (
              <div key={item.id} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between group hover:border-brand-teal transition-all">
                <div className="space-y-1">
                  <h4 className="font-bold text-brand-black">{item.name}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{item.stock} {item.unit} Remaining</p>
                </div>
                {item.stock < item.minStock ? (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl animate-pulse">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Low Stock</span>
                  </div>
                ) : (
                  <div className="text-green-500 bg-green-50 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest">Healthy</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Tracking */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-brand-black flex items-center gap-3">
              <ShoppingCart size={20} className="text-brand-lavender" /> Recent Orders
            </h3>
            <div className="flex items-center gap-2">
                <button className="p-2 bg-stone-100 rounded-lg text-stone-400 hover:text-brand-black transition-all"><Search size={16} /></button>
                <button className="p-2 bg-stone-100 rounded-lg text-stone-400 hover:text-brand-black transition-all"><Filter size={16} /></button>
                <button className="p-2 bg-stone-100 rounded-lg text-stone-400 hover:text-brand-black transition-all"><Download size={16} /></button>
            </div>
          </div>
          <div className="glass rounded-[3rem] p-8 shadow-xl border-white bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="pb-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Order ID</th>
                    <th className="pb-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Customer</th>
                    <th className="pb-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                    <th className="pb-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Total</th>
                    <th className="pb-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-stone-50 transition-colors">
                      <td className="py-6 font-black text-brand-black text-sm">{order.id}</td>
                      <td className="py-6 font-bold text-stone-600 text-sm">{order.customer}</td>
                      <td className="py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Completed' ? 'bg-green-50 text-green-600' : 
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-6 font-black text-brand-black text-sm">${order.total.toFixed(2)}</td>
                      <td className="py-6 text-stone-400 text-xs font-bold">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Margin Alert */}
      <div className="bg-brand-black rounded-[3rem] p-12 text-white border-2 border-brand-black shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3 text-brand-teal">
              <TrendingUp size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Profit Margin Analysis</span>
            </div>
            <h3 className="text-3xl font-serif font-black italic">"You're in the Green."</h3>
            <p className="text-stone-400 text-lg leading-relaxed">
              Your current profit margin is <span className="text-white font-bold">68%</span>. All operational costs are optimized and your business is fully compliant with local codes.
            </p>
          </div>
          <div className="w-full md:w-64 h-32 bg-white/5 rounded-[2rem] border border-white/10 p-6 flex items-center justify-center">
            <div className="text-center">
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">Health Score</p>
                <p className="text-5xl font-black text-brand-teal">98<span className="text-xl text-stone-600">/100</span></p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-8 opacity-5">
            <Shield size={160} />
        </div>
      </div>
    </div>
  );
};
