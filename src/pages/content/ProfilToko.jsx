// src/pages/ProfilToko.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Store, Phone, MapPin, Save, Lock, AlertCircle, Check, ShieldCheck 
} from 'lucide-react';

const ProfilToko = () => {
  // --- STATE ---
  const [user, setUser] = useState({
    name: '',
    store_name: '',
    phone: '',
    address: ''
  });

  const [passData, setPassData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isExiting: false });

  // --- INIT ---
  useEffect(() => {
    // Load initial data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUser({
            name: storedUser.name || '',
            store_name: storedUser.store_name || '',
            phone: storedUser.phone || '', // Handle null
            address: storedUser.address || '' // Handle null
        });
    }
  }, []);

  // --- HELPERS ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isExiting: false });
  };

  useEffect(() => {
    if (toast.show) {
      const t1 = setTimeout(() => setToast(prev => ({ ...prev, isExiting: true })), 2700);
      const t2 = setTimeout(() => setToast(prev => ({ ...prev, show: false, isExiting: false })), 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [toast.show]);

  // --- HANDLERS ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:8000/api/profile/update', user, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.success) {
            // Update Local Storage so Sidebar & Struk update immediately
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            triggerToast('Profil berhasil diperbarui!');
        }
    } catch (error) {
        if (error.response && error.response.data.errors) {
            // Show the first validation error (e.g. duplicate name)
            const firstError = Object.values(error.response.data.errors).flat()[0];
            triggerToast(firstError, 'error');
        } else {
            triggerToast('Gagal memperbarui profil.', 'error');
        }
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.password !== passData.password_confirmation) {
        return triggerToast('Konfirmasi password tidak cocok.', 'error');
    }
    
    setPassLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:8000/api/profile/password', passData, {
            headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' }
        });

        if (response.data.success) {
            triggerToast('Password berhasil diubah!');
            setPassData({ current_password: '', password: '', password_confirmation: '' });
        }
    } catch (error) {
        const msg = error.response?.data?.message || 'Gagal mengubah password.';
        triggerToast(msg, 'error');
    } finally {
        setPassLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto relative">
      
      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-100 pointer-events-none">
           <div className={`pointer-events-auto bg-white border shadow-xl rounded-full px-6 py-3 flex items-center gap-3 relative overflow-hidden ${toast.type === 'error' ? 'border-red-100 shadow-red-500/10' : 'border-slate-200 shadow-slate-200/50'} animate-in fade-in slide-in-from-top-2`}>
              <div className={`p-1 rounded-full ${toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 {toast.type === 'error' ? <AlertCircle size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}
              </div>
              <span className="text-slate-700 font-medium text-sm pr-2">{toast.message}</span>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profil Toko</h1>
        <p className="text-slate-500 mt-1">Kelola informasi toko dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: EDIT PROFILE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-[#307fe2]">
                    <Store size={20} />
                </div>
                <h2 className="font-bold text-slate-800">Informasi Umum</h2>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-5">
                {/* Nama Pemilik */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pemilik</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" size={18} />
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm"
                            value={user.name}
                            onChange={e => setUser({...user, name: e.target.value})}
                        />
                    </div>
                </div>

                {/* Nama Toko */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Toko</label>
                    <div className="relative group">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" size={18} />
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm"
                            value={user.store_name}
                            onChange={e => setUser({...user, store_name: e.target.value})}
                        />
                    </div>
                </div>

                {/* Telepon */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Telepon (Opsional)</label>
                    <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm"
                            placeholder="0812..."
                            value={user.phone}
                            onChange={e => setUser({...user, phone: e.target.value})}
                        />
                    </div>
                </div>

                {/* Alamat */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Toko (Opsional)</label>
                    <div className="relative group">
                        <MapPin className="absolute left-3 top-3 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" size={18} />
                        <textarea 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm min-h-[100px]"
                            placeholder="Jl. Contoh No. 123..."
                            value={user.address}
                            onChange={e => setUser({...user, address: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#307fe2] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                    </button>
                </div>
            </form>
        </div>

        {/* RIGHT: CHANGE PASSWORD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <ShieldCheck size={20} />
                </div>
                <h2 className="font-bold text-slate-800">Keamanan</h2>
            </div>

            <form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
                {/* Current Password */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password Saat Ini</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                            value={passData.current_password}
                            onChange={e => setPassData({...passData, current_password: e.target.value})}
                        />
                    </div>
                </div>

                <div className="border-t border-dashed border-slate-200 my-2"></div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                            value={passData.password}
                            onChange={e => setPassData({...passData, password: e.target.value})}
                        />
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                            value={passData.password_confirmation}
                            onChange={e => setPassData({...passData, password_confirmation: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={passLoading}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {passLoading ? 'Memproses...' : 'Ubah Password'}
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilToko;