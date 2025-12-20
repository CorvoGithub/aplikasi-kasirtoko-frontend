// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Store, ShieldCheck, Check, AlertCircle,
  TrendingUp, Package, Wallet, History,
} from "lucide-react";

const Register = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    store_name: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  // --- LOGIC: TOAST ---
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type, isExiting: false });
  };

  useEffect(() => {
    if (toast.show) {
      const exitTimer = setTimeout(
        () => setToast((prev) => ({ ...prev, isExiting: true })),
        2700
      );
      const removeTimer = setTimeout(
        () => setToast((prev) => ({ ...prev, show: false, isExiting: false })),
        3000
      );
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toast.show]);

  // --- LOGIC: REGISTER ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
        setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
        return triggerToast("Password konfirmasi tidak cocok", 'error');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        triggerToast('Registrasi Berhasil! Silahkan login.', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        if (response.status === 422 && data.errors) {
            const firstError = Object.values(data.errors).flat()[0];
            triggerToast(firstError, 'error');
        } else {
            triggerToast(data.message || 'Gagal Mendaftar.', 'error');
        }

        setFormData(prev => ({ 
            ...prev, 
            password: '', 
            password_confirmation: '' 
        }));
      }
    } catch (err) {
      console.error("Register Error:", err);
      triggerToast('Koneksi Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800 relative">
      {/* ================= CUSTOM TOAST ================= */}
      {toast.show && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-100 pointer-events-none">
          <div
            className={`pointer-events-auto bg-white border shadow-xl rounded-full px-6 py-3 flex items-center gap-3 relative overflow-hidden ${
              toast.type === "error"
                ? "border-red-100 shadow-red-500/10"
                : "border-slate-200 shadow-slate-200/50"
            } ${
              toast.isExiting
                ? "animate-[slideUp_0.4s_ease-in_forwards]"
                : "animate-[slideDown_0.4s_ease-out_forwards]"
            }`}
          >
            <div
              className={`p-1 rounded-full relative z-10 ${
                toast.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={14} strokeWidth={3} />
              ) : (
                <Check size={14} strokeWidth={3} />
              )}
            </div>
            <span className="text-slate-700 font-medium text-sm relative z-10 pr-2">
              {toast.message}
            </span>
            <div
              className={`absolute bottom-0 left-0 h-[3px] w-full animate-[shrink_3s_linear_forwards] ${
                toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* LEFT SIDE (Animation) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#307fe2] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <img
              src="/images/m_white.png"
              alt="Mantra POS"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xl font-semibold tracking-wide">Mantra</span>
        </div>

        {/* --- STAGGERED STACK ANIMATION --- */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          {/* The Container floats gently */}
          <div className="relative w-full max-w-sm animate-[float_6s_ease-in-out_infinite]">
            
            {/* Decoration Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

            {/* Card 1: Revenue (Top - White Card) */}
            <div className="relative z-30 bg-white p-4 rounded-2xl shadow-xl shadow-blue-900/20 mb-4 transform opacity-0 animate-[entryUp_0.6s_ease-out_forwards]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-[#307fe2]">
                    <Wallet size={18} />
                  </div>
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Pendapatan
                  </span>
                </div>
                <span className="text-emerald-500 text-xs font-bold flex items-center">
                  +24% <TrendingUp size={12} className="ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Rp 12.500.000
              </h3>
            </div>

            {/* Card 2: Sales History (Middle - Glassy Blue) */}
            <div className="relative z-20 bg-blue-500/30 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg mb-4 transform opacity-0 animate-[entryUp_0.6s_ease-out_0.15s_forwards]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <History size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Riwayat Penjualan
                  </p>
                  <p className="text-xs text-blue-100">
                    Jejak transaksi lengkap
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                    <div className="w-16 h-1.5 bg-white/40 rounded-full"></div>
                  </div>
                  <div className="w-8 h-1.5 bg-white/20 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                    <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="w-10 h-1.5 bg-white/10 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                    <div className="w-14 h-1.5 bg-white/30 rounded-full"></div>
                  </div>
                  <div className="w-6 h-1.5 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Card 3: New Product (Bottom - Deep Brand Blue) */}
            {/* REMOVED: ml-8 class to fix alignment */}
            <div className="relative z-10 bg-[#1e5bb8] p-4 rounded-2xl shadow-xl transform opacity-0 animate-[entryUp_0.6s_ease-out_0.3s_forwards] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 text-blue-200 rounded-lg">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-200">Stok Barang</p>
                  <p className="text-sm font-bold text-white">
                    Produk Berhasil Ditambahkan
                  </p>
                </div>
                <div className="ml-auto">
                  <Check size={18} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text with Animation */}
        <div className="relative z-10 transform opacity-0 animate-[entryUp_0.6s_ease-out_0.5s_forwards]">
          <h2 className="text-2xl font-bold mb-2">Welcome to Mantra</h2>
          <p className="text-blue-100 text-sm opacity-80">
            Integrasikan berbagai aspek pengelolaan toko dalam satu tempat.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Buat Akun Baru
            </h1>
            <p className="text-slate-500">
              Lengkapi data di bawah ini untuk mendaftar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Lengkap
              </label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nama Toko
              </label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Konfirmasi
                </label>
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
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-[#307fe2] font-semibold hover:text-[#ffad00] transition-colors"
              >
                Login disini
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Inline Animations */}
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-150%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-150%); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        @keyframes entryUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Register;