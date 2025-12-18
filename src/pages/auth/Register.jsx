// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    store_name: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
        return toast.error("Password tidak cocok");
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Registrasi Berhasil!', { description: 'Silahkan login dengan akun baru Anda.' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error('Gagal Mendaftar', { description: data.message || 'Cek kelengkapan data.' });
      }
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Koneksi Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      
      {/* LEFT SIDE (Brand Blue) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#307fe2] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <img
              src="/images/m_white.png"
              alt="Mantra POS"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-wide">Mantra</span>
        </div>

        <div className="relative z-10 mb-20">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
                Mulai Kelola <br/>
                <span className="text-[#ffad00]">Toko Anda</span>
            </h2>
            <div className="space-y-6">
                {[
                    "Kelola barang milik toko anda",
                    "Transaksi penjualan otomatis",
                    "Riwayat penjualan lengkap"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="p-1 bg-[#ffad00] rounded-full">
                            <ShieldCheck className="w-2 h-2 text-[#ffad00]" />
                        </div>
                        <p className="text-lg text-blue-50">{item}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Text */}
        <p className="relative z-10 text-sm text-blue-200">© 2025 Mantra System. All rights reserved.</p>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Buat Akun Baru</h1>
            <p className="text-slate-500">Lengkapi data di bawah ini untuk mendaftar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                  placeholder="Nama Pemilik Toko"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Toko</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  name="store_name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                  placeholder="Contoh: Toko Berkah"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                  placeholder="nama@email.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                    </div>
                    <input
                      name="password_confirmation"
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                      placeholder="••••••••"
                      onChange={handleChange}
                    />
                  </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#307fe2] hover:bg-[#2563b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307fe2] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-6"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-[#307fe2] font-semibold hover:text-[#ffad00] transition-colors">
                Login disini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;