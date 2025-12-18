// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  Plus,
  Clock,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState({
    total_revenue: 0,
    total_products: 0,
    total_transactions: 0,
    today_revenue: 0,
    recent_activity: []
  });
  const navigate = useNavigate();

  // 1. Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:8000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 2. Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${parseInt(data.total_revenue).toLocaleString('id-ID')}`,
      icon: DollarSign,
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      description: 'Akumulasi semua penjualan'
    },
    {
      title: 'Total Produk',
      value: data.total_products,
      icon: Package,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      description: 'Item terdaftar di sistem'
    },
    {
      title: 'Total Transaksi',
      value: data.total_transactions,
      icon: ShoppingCart,
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      description: 'Bon/Resi berhasil dibuat'
    },
    {
      title: "Omset Hari Ini",
      value: `Rp ${parseInt(data.today_revenue).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      description: 'Pendapatan per hari ini'
    }
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#307fe2]"></div>
        </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
          <p className="text-slate-500 mt-1">Ringkasan performa toko Mantra Anda hari ini.</p>
        </div>
        {/* Date Badge */}
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
            <Calendar size={16} className="text-[#307fe2]" />
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.text} p-3 rounded-xl`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-1">{stat.value}</h3>
              <p className="text-xs text-slate-400">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Transaksi Terakhir</h3>
            <button 
                onClick={() => navigate('/dashboard/riwayat')}
                className="text-sm font-medium text-[#307fe2] hover:text-blue-700 hover:underline"
            >
                Lihat Semua
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {data.recent_activity.length > 0 ? (
              <table className="w-full">
                <tbody className="divide-y divide-slate-50">
                    {data.recent_activity.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <DollarSign size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.invoice}</p>
                                        <p className="text-xs text-slate-500">Penjualan Sukses</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <p className="font-bold text-slate-900 text-sm">
                                    +Rp {parseInt(item.amount).toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-slate-400">{item.date}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
              </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <ShoppingCart size={32} />
                    </div>
                    <p>Belum ada transaksi hari ini.</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-[#307fe2] rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="font-bold text-lg mb-2">Aksi Cepat</h3>
            <p className="text-blue-100 text-sm mb-6 opacity-90">
                Akses fitur utama dengan sekali klik untuk mempercepat operasional.
            </p>
            
            <div className="space-y-3">
                <button 
                    onClick={() => navigate('/dashboard/penjualan')}
                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm group"
                >
                    <span className="font-medium flex items-center gap-3">
                        <div className="bg-white text-[#307fe2] p-1.5 rounded-lg">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        Buat Transaksi
                    </span>
                    <ArrowUpRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={() => navigate('/dashboard/kelola')}
                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm group"
                >
                    <span className="font-medium flex items-center gap-3">
                        <div className="bg-[#ffad00] text-white p-1.5 rounded-lg">
                            <Package size={16} strokeWidth={3} />
                        </div>
                        Tambah Barang
                    </span>
                    <ArrowUpRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
          
          {/* LIVE CLOCK WIDGET (Updated with Seconds) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
             
             <Clock size={32} className="text-[#307fe2] mb-3 relative z-10" />
             <h3 className="text-3xl lg:text-4xl font-mono font-bold text-slate-800 tracking-wider relative z-10">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </h3>
             <p className="text-slate-500 text-sm mt-1 relative z-10">Waktu Server (WIB)</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;